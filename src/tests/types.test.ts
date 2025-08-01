import { describe, it, expect } from "vitest";
import type { ReportParams, ReportStatus } from "../types";

describe("Types", () => {
    it("should allow valid ReportParams structure", () => {
        const validParams: ReportParams = {
            SNAPTYPE: "EOD",
            RISKCLASS: "EQUITY",
            cobDate: "20231231",
        };

        expect(Object.keys(validParams)).toContain("SNAPTYPE");
        expect(Object.keys(validParams)).toContain("RISKCLASS");
        expect(Object.keys(validParams)).toContain("cobDate");
    });

    it("should allow valid ReportStatus structure", () => {
        const validStatus: ReportStatus = {
            timestamp: "2023-10-01T00:00:00Z",
            isStale: true,
        };

        expect(validStatus.timestamp).toBe("2023-10-01T00:00:00Z");
        expect(validStatus.isStale).toBe(true);
    });

    it("should allow fresh status", () => {
        const freshStatus: ReportStatus = {
            timestamp: "2023-10-01T10:30:00Z",
            isStale: false,
        };

        expect(freshStatus.isStale).toBe(false);
    });
});
