import { expect } from "vitest";
import { difference } from "lodash";
import { isFirstStep, Step } from "./testUtils";

export const extendMatchers = () => {
  expect.extend({
    toHaveBeenCreatedAtStep: function (
      actual,
      expected,
      { currentStep, stepIndex, steps }: ToHaveBeenCreatedAtStepParams
    ) {
      const {
        BOLD_WEIGHT: bold,
        DIM_COLOR: dimColor,
        EXPECTED_COLOR: expectedColor,
        INVERTED_COLOR: invertedColor,
        RECEIVED_COLOR: receivedColor,
      } = this.utils;

      const pass = difference(expected, actual).length === 0;

      if (isFirstStep(currentStep)) {
        const message = () =>
          [
            `At the ${bold("first step")} we expected`,
            `${expected.join(", ")}`,
            `to have been created, but`,
            `${actual.join(", ")} were created instead.`,
          ].join("\n");

        return {
          pass,
          message,
          actual,
          expected,
        };
      }

      const [, ...followingSteps] = steps;
      const stepNumber = stepIndex + 1;
      const stepsSegment = followingSteps
        .map((step, index) => {
          const baseString = step.resolved ? step.resolved : `${step.rejected}`;

          if (index === stepIndex) {
            return bold(baseString);
          }

          return baseString;
        })
        .join(" -> ");
      const message = () =>
        [
          `At the step ${stepNumber} (${stepsSegment}) we expected`,
          `${expected.join(", ")}`,
          `to have been created, but`,
          `${actual.join(", ")} were created instead.`,
        ].join("\n");

      return {
        pass: difference(expected, actual).length === 0,
        message,
        actual,
        expected,
      };
    },
  });
};

type ToHaveBeenCreatedAtStepParams = {
  steps: Array<Step>;
  currentStep: Step;
  stepIndex: number;
};

interface CustomMatchers<R = unknown> {
  toHaveBeenCreatedAtStep(
    promisesCreatedLabels: Array<string>,
    params: ToHaveBeenCreatedAtStepParams
  ): R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
