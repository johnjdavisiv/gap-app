/**
 * GPX Parser Module
 * Parses GPX files and calculates distances, grades, and generates route segments
 */

class GPXParser {
    constructor() {
        this.trackPoints = [];
        this.segments = [];
        this.totalDistance = 0;
    }

    /**
     * Parse GPX file content
     * @param {string} gpxContent - The raw GPX file content
     * @returns {Promise<boolean>} - Success status
     */
    async parseGPX(gpxContent) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(gpxContent, "text/xml");

            // Check for parsing errors
            const parserError = xmlDoc.querySelector("parsererror");
            if (parserError) {
                throw new Error("Invalid GPX file format");
            }

            // Extract track points
            const trkpts = xmlDoc.querySelectorAll("trkpt");
            if (trkpts.length === 0) {
                throw new Error("No track points found in GPX file");
            }

            this.trackPoints = [];
            trkpts.forEach(trkpt => {
                const lat = parseFloat(trkpt.getAttribute("lat"));
                const lon = parseFloat(trkpt.getAttribute("lon"));
                const eleElement = trkpt.querySelector("ele");
                const ele = eleElement ? parseFloat(eleElement.textContent) : 0;

                if (!isNaN(lat) && !isNaN(lon)) {
                    this.trackPoints.push({ lat, lon, ele });
                }
            });

            if (this.trackPoints.length < 2) {
                throw new Error("Need at least 2 track points to calculate route");
            }

            // Calculate segments
            this.calculateSegments();
            return true;

        } catch (error) {
            console.error("Error parsing GPX:", error);
            throw error;
        }
    }

    /**
     * Calculate distance between two lat/lon points using Haversine formula
     * @param {number} lat1 - Latitude of first point
     * @param {number} lon1 - Longitude of first point
     * @param {number} lat2 - Latitude of second point
     * @param {number} lon2 - Longitude of second point
     * @returns {number} - Distance in meters
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    /**
     * Calculate segments with distance, elevation, and grade
     */
    calculateSegments() {
        this.segments = [];
        this.totalDistance = 0;

        for (let i = 1; i < this.trackPoints.length; i++) {
            const prev = this.trackPoints[i - 1];
            const curr = this.trackPoints[i];

            const horizontalDistance = this.calculateDistance(
                prev.lat, prev.lon, curr.lat, curr.lon
            );

            // Skip segments that are too short (duplicate points)
            if (horizontalDistance < 0.1) continue;

            const elevationChange = curr.ele - prev.ele;
            const grade = elevationChange / horizontalDistance;

            const segment = {
                startPoint: prev,
                endPoint: curr,
                horizontalDistance,
                elevationChange,
                grade,
                startDistance: this.totalDistance,
                endDistance: this.totalDistance + horizontalDistance
            };

            this.segments.push(segment);
            this.totalDistance += horizontalDistance;
        }

        console.log(`Parsed ${this.segments.length} segments, total distance: ${(this.totalDistance / 1000).toFixed(2)}km`);
    }

    /**
     * Generate lap boundaries at specified intervals
     * @param {number} lapDistance - Distance of each lap in meters
     * @returns {Array} - Array of lap boundary objects
     */
    generateLapBoundaries(lapDistance) {
        const boundaries = [];
        let currentDistance = 0;
        let lapNumber = 1;

        // Add start
        boundaries.push({
            lapNumber: 0,
            distance: 0,
            point: this.trackPoints[0],
            elevation: this.trackPoints[0].ele
        });

        while (currentDistance + lapDistance <= this.totalDistance) {
            currentDistance += lapDistance;
            const point = this.getPointAtDistance(currentDistance);

            boundaries.push({
                lapNumber,
                distance: currentDistance,
                point,
                elevation: point.ele
            });

            lapNumber++;
        }

        // Add finish
        if (boundaries[boundaries.length - 1].distance < this.totalDistance) {
            boundaries.push({
                lapNumber: lapNumber,
                distance: this.totalDistance,
                point: this.trackPoints[this.trackPoints.length - 1],
                elevation: this.trackPoints[this.trackPoints.length - 1].ele
            });
        }

        return boundaries;
    }

    /**
     * Find the point and elevation at a specific distance along the route
     * @param {number} targetDistance - Distance in meters
     * @returns {Object} - Point with lat, lon, ele
     */
    getPointAtDistance(targetDistance) {
        if (targetDistance <= 0) return this.trackPoints[0];
        if (targetDistance >= this.totalDistance) return this.trackPoints[this.trackPoints.length - 1];

        for (let segment of this.segments) {
            if (targetDistance >= segment.startDistance && targetDistance <= segment.endDistance) {
                // Interpolate within this segment
                const ratio = (targetDistance - segment.startDistance) / segment.horizontalDistance;

                return {
                    lat: segment.startPoint.lat + ratio * (segment.endPoint.lat - segment.startPoint.lat),
                    lon: segment.startPoint.lon + ratio * (segment.endPoint.lon - segment.startPoint.lon),
                    ele: segment.startPoint.ele + ratio * (segment.endPoint.ele - segment.startPoint.ele)
                };
            }
        }

        return this.trackPoints[this.trackPoints.length - 1];
    }

    /**
     * Calculate average grade between two distances
     * @param {number} startDistance - Start distance in meters
     * @param {number} endDistance - End distance in meters
     * @returns {number} - Average grade as decimal (0.05 = 5%)
     */
    getAverageGrade(startDistance, endDistance) {
        if (startDistance >= endDistance) return 0;

        let totalElevationChange = 0;
        let totalHorizontalDistance = 0;

        for (let segment of this.segments) {
            // Check if segment overlaps with our range
            const segmentStart = Math.max(segment.startDistance, startDistance);
            const segmentEnd = Math.min(segment.endDistance, endDistance);

            if (segmentStart < segmentEnd) {
                const segmentLength = segmentEnd - segmentStart;
                const segmentRatio = segmentLength / segment.horizontalDistance;

                totalElevationChange += segment.elevationChange * segmentRatio;
                totalHorizontalDistance += segmentLength;
            }
        }

        return totalHorizontalDistance > 0 ? totalElevationChange / totalHorizontalDistance : 0;
    }

    /**
     * Calculate smoothed grade between current position and a point at minimum distance ahead
     * @param {number} startDistance - Starting distance in meters
     * @param {number} minDistance - Minimum distance to look ahead (default 100m)
     * @returns {number} - Smoothed grade as decimal
     */
    getSmoothedGrade(startDistance, minDistance = 100) {
        const endDistance = Math.min(startDistance + minDistance, this.totalDistance);

        // If we can't get the minimum distance, return 0
        if (endDistance - startDistance < minDistance * 0.5) {
            return 0;
        }

        const startPoint = this.getPointAtDistance(startDistance);
        const endPoint = this.getPointAtDistance(endDistance);

        const elevationChange = endPoint.ele - startPoint.ele;
        const horizontalDistance = endDistance - startDistance;

        return elevationChange / horizontalDistance;
    }

    /**
     * Get route statistics
     * @param {number} minGradeDistance - Minimum distance for grade calculations (default 100m)
     * @returns {Object} - Route statistics
     */
    getRouteStats(minGradeDistance = 100) {
        let totalElevationGain = 0;
        let totalElevationLoss = 0;
        let maxGrade = 0;
        let minGrade = 0;
        let smoothedMaxGrade = 0;
        let smoothedMinGrade = 0;

        // Calculate elevation gain/loss and original max/min grades from segments
        for (let segment of this.segments) {
            if (segment.elevationChange > 0) {
                totalElevationGain += segment.elevationChange;
            } else {
                totalElevationLoss += Math.abs(segment.elevationChange);
            }

            maxGrade = Math.max(maxGrade, segment.grade);
            minGrade = Math.min(minGrade, segment.grade);
        }

        // Calculate smoothed grades by sampling at regular intervals
        const sampleInterval = Math.min(50, minGradeDistance / 4); // Sample every 50m or 1/4 of min distance
        let smoothedGrades = [];

        for (let distance = 0; distance <= this.totalDistance - minGradeDistance; distance += sampleInterval) {
            const grade = this.getSmoothedGrade(distance, minGradeDistance);
            if (grade !== 0) { // Only include valid grades
                smoothedGrades.push(grade);
            }
        }

        // Calculate smoothed min/max from the collected grades
        if (smoothedGrades.length > 0) {
            smoothedMaxGrade = Math.max(...smoothedGrades);
            smoothedMinGrade = Math.min(...smoothedGrades);
        }

        return {
            totalDistance: this.totalDistance,
            totalElevationGain,
            totalElevationLoss,
            maxGrade,
            minGrade,
            smoothedMaxGrade,
            smoothedMinGrade,
            startElevation: this.trackPoints[0].ele,
            endElevation: this.trackPoints[this.trackPoints.length - 1].ele,
            netElevationChange: this.trackPoints[this.trackPoints.length - 1].ele - this.trackPoints[0].ele
        };
    }
}

// Export for use in other modules
window.GPXParser = GPXParser;