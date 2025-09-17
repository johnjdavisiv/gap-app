/**
 * Lap Calculator Module
 * Generates lap splits accounting for elevation changes using GAP calculations
 */

class LapCalculator {
    constructor(goalPaceSolver) {
        this.solver = goalPaceSolver;
        this.lapDistances = {
            '400m': 400,
            '1000m': 1000,
            '1km': 1000,
            '1mile': 1609.344,
            '5000m': 5000,
            '5km': 5000
        };
    }

    /**
     * Calculate lap splits for the route
     * @param {GPXParser} gpxParser - Parsed GPX data
     * @param {number} goalTimeSeconds - Target time in seconds
     * @param {string} lapInterval - Lap interval ('400m', '1000m', '1mile', etc.)
     * @param {number} segmentLength - Length of calculation segments in meters
     * @returns {Object} - Lap splits and analysis data
     */
    calculateLapSplits(gpxParser, goalTimeSeconds, lapInterval, segmentLength = 50) {
        console.log(`Calculating lap splits for ${lapInterval} intervals`);

        // Get lap distance
        const lapDistance = this.lapDistances[lapInterval];
        if (!lapDistance) {
            throw new Error(`Unsupported lap interval: ${lapInterval}`);
        }

        // Solve for base pace
        const solverResult = this.solver.findBasePaceForGoalTime(gpxParser, goalTimeSeconds, segmentLength);

        if (!solverResult.converged) {
            console.warn(`Solver did not converge. Final error: ${solverResult.finalError.toFixed(1)}s`);
        }

        // Generate lap boundaries
        const lapBoundaries = gpxParser.generateLapBoundaries(lapDistance);

        // Calculate detailed splits
        const lapSplits = this.calculateDetailedSplits(
            gpxParser,
            lapBoundaries,
            solverResult.basePaceM_s,
            segmentLength
        );

        // Calculate route analysis
        const routeAnalysis = this.analyzeRoute(gpxParser, lapSplits);

        return {
            goalTime: goalTimeSeconds,
            lapInterval: lapInterval,
            lapDistance: lapDistance,
            solverResult: solverResult,
            lapSplits: lapSplits,
            routeAnalysis: routeAnalysis,
            routeStats: gpxParser.getRouteStats()
        };
    }

    /**
     * Calculate detailed splits for each lap
     * @param {GPXParser} gpxParser - Parsed GPX data
     * @param {Array} lapBoundaries - Lap boundary points
     * @param {number} basePaceM_s - Base pace in m/s
     * @param {number} segmentLength - Length of calculation segments
     * @returns {Array} - Array of lap split objects
     */
    calculateDetailedSplits(gpxParser, lapBoundaries, basePaceM_s, segmentLength) {
        const splits = [];
        let cumulativeTime = 0;

        for (let i = 1; i < lapBoundaries.length; i++) {
            const lapStart = lapBoundaries[i - 1];
            const lapEnd = lapBoundaries[i];
            const lapDistance = lapEnd.distance - lapStart.distance;

            // Calculate time for this lap using fine segments
            const lapTime = this.calculateLapTime(
                gpxParser,
                lapStart.distance,
                lapEnd.distance,
                basePaceM_s,
                segmentLength
            );

            cumulativeTime += lapTime;

            // Calculate lap statistics
            const averageGrade = gpxParser.getAverageGrade(lapStart.distance, lapEnd.distance);
            const elevationChange = lapEnd.elevation - lapStart.elevation;
            const elevationGain = this.calculateElevationGain(gpxParser, lapStart.distance, lapEnd.distance);
            const elevationLoss = this.calculateElevationLoss(gpxParser, lapStart.distance, lapEnd.distance);

            const split = {
                lapNumber: i,
                startDistance: lapStart.distance,
                endDistance: lapEnd.distance,
                lapDistance: lapDistance,
                lapTime: lapTime,
                cumulativeTime: cumulativeTime,
                startElevation: lapStart.elevation,
                endElevation: lapEnd.elevation,
                elevationChange: elevationChange,
                elevationGain: elevationGain,
                elevationLoss: elevationLoss,
                averageGrade: averageGrade,
                averagePace: this.calculateAveragePace(lapDistance, lapTime),
                effortLevel: this.calculateEffortLevel(averageGrade)
            };

            splits.push(split);
        }

        return splits;
    }

    /**
     * Calculate time for a single lap segment
     * @param {GPXParser} gpxParser - Parsed GPX data
     * @param {number} startDistance - Start distance in meters
     * @param {number} endDistance - End distance in meters
     * @param {number} basePaceM_s - Base pace in m/s
     * @param {number} segmentLength - Length of calculation segments
     * @returns {number} - Lap time in seconds
     */
    calculateLapTime(gpxParser, startDistance, endDistance, basePaceM_s, segmentLength) {
        let totalTime = 0;
        let currentDistance = startDistance;

        while (currentDistance < endDistance) {
            const segmentEnd = Math.min(currentDistance + segmentLength, endDistance);
            const actualSegmentLength = segmentEnd - currentDistance;

            if (actualSegmentLength <= 0) break;

            // Get average grade for this segment
            const averageGrade = gpxParser.getAverageGrade(currentDistance, segmentEnd);

            // Apply GAP adjustment
            const adjustedSpeed = this.solver.applyGAPAdjustment(basePaceM_s, averageGrade);

            // Calculate time for this segment
            const segmentTime = actualSegmentLength / adjustedSpeed;
            totalTime += segmentTime;

            currentDistance = segmentEnd;
        }

        return totalTime;
    }

    /**
     * Calculate elevation gain within a distance range
     * @param {GPXParser} gpxParser - Parsed GPX data
     * @param {number} startDistance - Start distance in meters
     * @param {number} endDistance - End distance in meters
     * @returns {number} - Total elevation gain in meters
     */
    calculateElevationGain(gpxParser, startDistance, endDistance) {
        let totalGain = 0;

        for (let segment of gpxParser.segments) {
            if (segment.endDistance > startDistance && segment.startDistance < endDistance) {
                if (segment.elevationChange > 0) {
                    // Calculate overlap with our range
                    const overlapStart = Math.max(segment.startDistance, startDistance);
                    const overlapEnd = Math.min(segment.endDistance, endDistance);
                    const overlapRatio = (overlapEnd - overlapStart) / segment.horizontalDistance;

                    totalGain += segment.elevationChange * overlapRatio;
                }
            }
        }

        return totalGain;
    }

    /**
     * Calculate elevation loss within a distance range
     * @param {GPXParser} gpxParser - Parsed GPX data
     * @param {number} startDistance - Start distance in meters
     * @param {number} endDistance - End distance in meters
     * @returns {number} - Total elevation loss in meters (positive value)
     */
    calculateElevationLoss(gpxParser, startDistance, endDistance) {
        let totalLoss = 0;

        for (let segment of gpxParser.segments) {
            if (segment.endDistance > startDistance && segment.startDistance < endDistance) {
                if (segment.elevationChange < 0) {
                    // Calculate overlap with our range
                    const overlapStart = Math.max(segment.startDistance, startDistance);
                    const overlapEnd = Math.min(segment.endDistance, endDistance);
                    const overlapRatio = (overlapEnd - overlapStart) / segment.horizontalDistance;

                    totalLoss += Math.abs(segment.elevationChange) * overlapRatio;
                }
            }
        }

        return totalLoss;
    }

    /**
     * Calculate average pace for a lap
     * @param {number} distance - Distance in meters
     * @param {number} time - Time in seconds
     * @returns {number} - Pace in minutes per kilometer
     */
    calculateAveragePace(distance, time) {
        return (time / 60) / (distance / 1000);
    }

    /**
     * Calculate effort level based on grade
     * @param {number} grade - Average grade as decimal
     * @returns {string} - Effort description
     */
    calculateEffortLevel(grade) {
        const gradePercent = grade * 100;

        if (gradePercent > 8) return 'Very Hard';
        if (gradePercent > 4) return 'Hard';
        if (gradePercent > 1) return 'Moderate';
        if (gradePercent > -2) return 'Easy';
        if (gradePercent > -5) return 'Fast';
        return 'Very Fast';
    }

    /**
     * Analyze the route and provide insights
     * @param {GPXParser} gpxParser - Parsed GPX data
     * @param {Array} lapSplits - Calculated lap splits
     * @returns {Object} - Route analysis
     */
    analyzeRoute(gpxParser, lapSplits) {
        const routeStats = gpxParser.getRouteStats();

        // Find hardest and easiest laps
        let hardestLap = lapSplits[0];
        let easiestLap = lapSplits[0];
        let slowestLap = lapSplits[0];
        let fastestLap = lapSplits[0];

        for (let split of lapSplits) {
            if (split.averageGrade > hardestLap.averageGrade) hardestLap = split;
            if (split.averageGrade < easiestLap.averageGrade) easiestLap = split;
            if (split.averagePace > slowestLap.averagePace) slowestLap = split;
            if (split.averagePace < fastestLap.averagePace) fastestLap = split;
        }

        // Calculate pace variation
        const paces = lapSplits.map(s => s.averagePace);
        const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;
        const paceVariation = Math.sqrt(paces.reduce((sum, pace) => sum + Math.pow(pace - avgPace, 2), 0) / paces.length);

        return {
            hardestLap: hardestLap,
            easiestLap: easiestLap,
            slowestLap: slowestLap,
            fastestLap: fastestLap,
            averagePace: avgPace,
            paceVariation: paceVariation,
            totalClimbing: routeStats.totalElevationGain,
            totalDescending: routeStats.totalElevationLoss,
            netElevationChange: routeStats.netElevationChange
        };
    }

    /**
     * Format time in seconds to MM:SS
     * @param {number} timeSeconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(timeSeconds) {
        const minutes = Math.floor(timeSeconds / 60);
        const seconds = Math.floor(timeSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Format cumulative time in seconds to MM:SS or HH:MM:SS
     * @param {number} timeSeconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatCumulativeTime(timeSeconds) {
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
     * Generate CSV export of lap splits
     * @param {Array} lapSplits - Calculated lap splits
     * @returns {string} - CSV content
     */
    generateCSV(lapSplits) {
        const headers = [
            'Lap', 'Distance (m)', 'Split Time', 'Cumulative Time',
            'Pace (min/km)', 'Elevation Change (m)', 'Grade (%)', 'Effort'
        ];

        let csv = headers.join(',') + '\n';

        for (let split of lapSplits) {
            const row = [
                split.lapNumber,
                split.endDistance.toFixed(0),
                this.formatTime(split.lapTime),
                this.formatCumulativeTime(split.cumulativeTime),
                split.averagePace.toFixed(2),
                split.elevationChange.toFixed(1),
                (split.averageGrade * 100).toFixed(1),
                split.effortLevel
            ];
            csv += row.join(',') + '\n';
        }

        return csv;
    }
}

// Export for use in other modules
window.LapCalculator = LapCalculator;