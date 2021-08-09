import { ResultError } from "../types/result";
import * as gherkinUtils from "./utils/gherkin";
import { Feature } from "../types/cucumber";

const _ = require("lodash");

export const name = "no-superfluous-tags";

export function run(feature: Feature) {
    if (!feature) {
        return [];
    }
    let errors: ResultError[] = [];
    feature.children?.forEach(child => {
        const node = child.rule || child.background || child.scenario;
        checkTags(node, feature, feature.language, errors);
        if (node && "examples" in node) {
            // @ts-ignore
            node.examples?.forEach(example => {
                checkTags(example, feature, feature.language, errors);
                checkTags(example, node, feature.language, errors);
            });
        }
    });
    return errors;
}

function checkTags(child, parent, language, errors: ResultError[]) {
    const superfluousTags = _.intersectionBy(child.tags, parent.tags, "name");
    const childType = gherkinUtils.getNodeType(child, language);
    const parentType = gherkinUtils.getNodeType(parent, language);
    superfluousTags.forEach(tag => {
        errors.push({
            message: `Tag duplication between ${childType} and its corresponding ${parentType}: ${tag.name}`,
            rule: name,
            line: tag.location.line,
        });
    });
}