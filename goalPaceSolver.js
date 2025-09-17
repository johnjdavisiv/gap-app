/**
 * Goal Pace Solver Module
 * Implements iterative algorithm to find the correct base pace that achieves target goal time
 * when adjusted for elevation changes using GAP calculations
 */

class GoalPaceSolver {
    constructor(gapCalculator) {
        this.gapCalculator = gapCalculator;
        this.maxIterations = 20;
        this.tolerance = 1.0; // seconds tolerance
        this.downhillAdjustments = []; // Track segments where downhill speed capping was applied
    }

    /**
     * Find the base pace (flat ground equivalent) needed to achieve goal time
     * @param {GPXParser} gpxParser - Parsed GPX data
     * @param {number} goalTimeSeconds - Target time in seconds
     * @param {number} segmentLength - Length of calculation segments in meters (default 50m)
     * @returns {Object} - Solver result with base pace and convergence info
     */
    findBasePaceForGoalTime(gpxParser, goalTimeSeconds, segmentLength = 50) {
        console.log(`Solving for goal time: ${this.formatTime(goalTimeSeconds)}`);

        // Reset downhill adjustments tracking for new calculation
        this.downhillAdjustments = [];

        const totalDistance = gpxParser.totalDistance;

        // Initial guess: simple average pace
        let basePaceMinPerKm = (goalTimeSeconds / 60) / (totalDistance / 1000);
        let basePaceM_s = this.paceToSpeed(basePaceMinPerKm);

        let iteration = 0;
        let bestError = Infinity;
        let bestPace = basePaceM_s;

        const convergenceHistory = [];

        while (iteration < this.maxIterations) {
            // Calculate predicted time with current base pace
            const predictedTime = this.calculateTotalTime(gpxParser, basePaceM_s, segmentLength);
            const error = predictedTime - goalTimeSeconds;

            convergenceHistory.push({
                iteration,
                basePace: this.speedToPace(basePaceM_s),
                predictedTime: predictedTime,
                error: error,
                errorPercent: (error / goalTimeSeconds) * 100
            });

            console.log(`Iteration ${iteration}: Base pace ${this.speedToPace(basePaceM_s).toFixed(2)} min/km, ` +
                       `predicted ${this.formatTime(predictedTime)}, error ${error.toFixed(1)}s`);

            // Track best result
            if (Math.abs(error) < Math.abs(bestError)) {
                bestError = error;
                bestPace = basePaceM_s;
            }

            // Check convergence
            if (Math.abs(error) <= this.tolerance) {
                console.log(`Converged in ${iteration + 1} iterations`);
                break;
            }

            // Adjust base pace based on error
            // If predicted time is too long, need to go faster (decrease pace time)
            if (error > 0) {
                // Too slow, increase speed (decrease pace)
                basePaceM_s *= 1 + (Math.abs(error) / goalTimeSeconds) * 0.5;
            } else {
                // Too fast, decrease speed (increase pace)
                basePaceM_s *= 1 - (Math.abs(error) / goalTimeSeconds) * 0.5;
            }

            // Sanity bounds - don't go below 2:30/km or above 12:00/km
            const minSpeed = this.paceToSpeed(12.0); // 12 min/km
            const maxSpeed = this.paceToSpeed(2.5);  // 2.5 min/km
            basePaceM_s = Math.max(minSpeed, Math.min(maxSpeed, basePaceM_s));

            iteration++;
        }

        // Use best result if we didn't converge
        if (Math.abs(bestError) < Math.abs(convergenceHistory[convergenceHistory.length - 1].error)) {
            basePaceM_s = bestPace;
        }

        const finalPredictedTime = this.calculateTotalTime(gpxParser, basePaceM_s, segmentLength);

        return {
            basePaceM_s: basePaceM_s,
            basePaceMinPerKm: this.speedToPace(basePaceM_s),
            finalError: finalPredictedTime - goalTimeSeconds,
            converged: Math.abs(finalPredictedTime - goalTimeSeconds) <= this.tolerance,
            iterations: iteration,
            convergenceHistory: convergenceHistory,
            predictedTime: finalPredictedTime,
            downhillAdjustments: this.downhillAdjustments
        };
    }

    /**
     * Calculate total time for a route given a base pace
     * @param {GPXParser} gpxParser - Parsed GPX data
     * @param {number} basePaceM_s - Base pace in m/s
     * @param {number} segmentLength - Length of calculation segments in meters
     * @returns {number} - Total time in seconds
     */
    calculateTotalTime(gpxParser, basePaceM_s, segmentLength = 50) {
        let totalTime = 0;
        let currentDistance = 0;

        // Calculate time for each segment
        while (currentDistance < gpxParser.totalDistance) {
            const segmentEnd = Math.min(currentDistance + segmentLength, gpxParser.totalDistance);
            const actualSegmentLength = segmentEnd - currentDistance;

            if (actualSegmentLength <= 0) break;

            // Get average grade for this segment
            const averageGrade = gpxParser.getAverageGrade(currentDistance, segmentEnd);

            // Apply GAP adjustment to get actual pace for this segment
            const adjustedSpeed = this.applyGAPAdjustment(basePaceM_s, averageGrade, currentDistance, segmentEnd);

            // Calculate time for this segment
            const segmentTime = actualSegmentLength / adjustedSpeed;
            totalTime += segmentTime;

            currentDistance = segmentEnd;
        }

        return totalTime;
    }

    /**
     * Apply GAP adjustment to convert base pace to actual pace for given grade
     * @param {number} basePaceM_s - Base flat-ground pace in m/s
     * @param {number} grade - Grade as decimal (0.05 = 5%)
     * @param {number} segmentStart - Optional: start distance of segment for tracking (meters)
     * @param {number} segmentEnd - Optional: end distance of segment for tracking (meters)
     * @returns {number} - Adjusted speed in m/s
     */
    applyGAPAdjustment(basePaceM_s, grade, segmentStart = null, segmentEnd = null) {
        // Use the existing GAP calculation functions from scripts.js

        // Calculate expected energetic cost for flat ground at base pace
        let flatCr = lookupSpeed(basePaceM_s, 'energy_j_kg_m');
        if (isNaN(flatCr)) {
            // If outside lookup range, use approximate calculation
            flatCr = 4.0; // Reasonable default J/kg/m
        }

        // Calculate additional energetic cost due to grade
        let deltaCr = calcDeltaEC(grade);
        let totalCr = flatCr + deltaCr;

        // Convert to metabolic power and find equivalent flat speed
        let totalWkg = totalCr * basePaceM_s;
        let equivalentFlatSpeed = getEquivFlatSpeed(totalWkg);

        if (!Number.isFinite(equivalentFlatSpeed) || equivalentFlatSpeed <= 0) {
            // Fallback calculation if GAP lookup fails
            // Use simplified approach: speed = base_speed * (1 - grade_penalty)
            const gradePenalty = Math.max(-0.5, Math.min(0.8, grade * 10));
            return basePaceM_s * (1 - gradePenalty);
        }

        // For forward GAP: we want actual speed on hill for given effort
        // The GAP calculation gives us equivalent flat speed for given hill pace
        // We need to reverse this: given flat effort, what's the hill pace?

        // Reverse calculation: if we want to maintain base effort, what speed on this grade?
        let targetWkg = lookupSpeed(basePaceM_s, 'energy_j_kg_s');
        if (isNaN(targetWkg)) {
            targetWkg = flatCr * basePaceM_s;
        }

        // Find speed that gives target metabolic power on this grade
        let actualSpeed = targetWkg / totalCr;

        if (!Number.isFinite(actualSpeed) || actualSpeed <= 0) {
            // Fallback to simple grade penalty
            const gradePenalty = Math.max(-0.5, Math.min(0.8, grade * 10));
            return basePaceM_s * (1 - gradePenalty);
        }

        // Apply steep downhill speed limitations
        // Beyond ~8-10% decline, runners can't achieve the theoretical metabolically equivalent pace
        // due to safety concerns and biomechanical limitations
        if (grade < -0.08) {
            const originalSpeed = actualSpeed;
            actualSpeed = this.applyDownhillSpeedCap(actualSpeed, basePaceM_s, grade);

            // Track this adjustment if segment boundaries are provided and speed was actually capped
            if (segmentStart !== null && segmentEnd !== null && actualSpeed < originalSpeed) {
                this.downhillAdjustments.push({
                    startDistance: segmentStart,
                    endDistance: segmentEnd,
                    grade: grade,
                    theoreticalSpeed: originalSpeed,
                    actualSpeed: actualSpeed,
                    speedReduction: ((originalSpeed - actualSpeed) / originalSpeed) * 100
                });
            }
        }

        return actualSpeed;
    }

    /**
     * Apply speed cap for steep downhills where theoretical GAP cannot be safely achieved
     * @param {number} theoreticalSpeed - The speed calculated by pure GAP theory
     * @param {number} basePaceM_s - Base flat-ground pace in m/s
     * @param {number} grade - Grade as decimal (negative for downhill)
     * @returns {number} - Speed capped for safety on steep downhills
     */
    applyDownhillSpeedCap(theoreticalSpeed, basePaceM_s, grade) {
        // Progressive limitation for downhills steeper than -8%
        const steepnessThreshold = -0.08; // -8% grade
        const maxSteepness = -0.25; // -25% grade where we apply maximum limitation

        if (grade >= steepnessThreshold) {
            return theoreticalSpeed; // No limitation needed
        }

        // Calculate limitation factor based on steepness
        // At -8%: no limitation (factor = 1.0)
        // At -25% and beyond: maximum limitation (factor approaches minimum)
        const steepnessFactor = Math.max(0, (grade - steepnessThreshold) / (maxSteepness - steepnessThreshold));
        const limitationFactor = 1.0 - (steepnessFactor * 0.6); // Max 60% speed reduction

        // Calculate maximum safe speed as a multiple of base pace
        // Even on steep downhills, don't allow more than 50% speed increase over base pace
        const maxSafeSpeed = basePaceM_s * 1.5;

        // Apply the more restrictive of the two limitations
        const cappedSpeed = Math.min(theoreticalSpeed * limitationFactor, maxSafeSpeed);

        // Ensure we don't go slower than base pace (that would be silly)
        return Math.max(cappedSpeed, basePaceM_s);
    }

    /**
     * Convert pace in min/km to speed in m/s
     * @param {number} paceMinPerKm - Pace in minutes per kilometer
     * @returns {number} - Speed in m/s
     */
    paceToSpeed(paceMinPerKm) {
        return 1000 / (paceMinPerKm * 60);
    }

    /**
     * Convert speed in m/s to pace in min/km
     * @param {number} speedM_s - Speed in m/s
     * @returns {number} - Pace in minutes per kilometer
     */
    speedToPace(speedM_s) {
        return 1000 / (speedM_s * 60);
    }

    /**
     * Format time in seconds to MM:SS or HH:MM:SS
     * @param {number} timeSeconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(timeSeconds) {
        const hours = Math.floor(timeSeconds / 3600);
        const minutes = Math.floor((timeSeconds % 3600) / 60);
        const seconds = Math.floor(timeSeconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Parse time string (MM:SS or HH:MM:SS) to seconds
     * @param {string} timeString - Time string
     * @returns {number} - Time in seconds
     */
    parseTime(timeString) {
        const parts = timeString.split(':').map(p => parseInt(p));

        if (parts.length === 2) {
            // MM:SS
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else {
            throw new Error('Invalid time format. Use MM:SS or HH:MM:SS');
        }
    }
}

// Export for use in other modules
window.GoalPaceSolver = GoalPaceSolver;