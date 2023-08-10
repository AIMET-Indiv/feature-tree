import { financial } from "./problems/financial";
import { memtalIllness } from "./problems/mental_illness";
import { relativeRelationship } from "./problems/relative_relationship";
import { romanticRelationship } from "./problems/romantic_relationship";
import { work } from "./problems/Work";
import { friendship } from "./problems/friendship";
import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs';

export type TreeNode = {
    label: string;
    children: TreeNode[]; // sort by frequency
    isLeaf?: boolean;
    examples?: string[]; // from actual dataset, >= 2 per leaf
};

const data: TreeNode = {
    label: "Mental Health Problems",
    children: [
        romanticRelationship,
        work,
        relativeRelationship,
        friendship,
        financial,
        memtalIllness,
    ]
};

const countLeaves = (n: TreeNode): number => {
    if (n.children.length === 0)
        return 1;

    return n.children.map(countLeaves).reduce((p, c) => p + c, 0);
}

const checkLeaves = (n: TreeNode, path = ""): void => {
    if (n.children.length === 0) {
        if ((n.examples ?? []).length === 0)
            console.log("Leaf with no example:", path + n.label);
        return;
    }

    n.children.forEach(child => checkLeaves(child, path + n.label + " -> "));
}

const getExamples = (n: TreeNode): string[] => {
    return [...(n.examples ?? []), ...n.children.flatMap(getExamples)];
}

const clearExamples = (n: TreeNode): TreeNode => {
    return {
        ...n,
        examples: undefined,
        children: n.children.map(clearExamples)
    };
}

const examples = getExamples(data);

checkLeaves(data);
console.log(countLeaves(data), 'leaves');
console.log(examples.length, 'examples');

fs.writeFileSync('./data.json', JSON.stringify(clearExamples(data)));

const features = ['is_addiction', 'is_sulking', 'is_cheating', 'is_self_esteem', 'is_abusing', 'is_relative_relationship', 'is_romantic_relationship', 'is_friendship'];
const tableLabels = ['Content', ...features];

// let python = 'data = [' + examples.map(ex => JSON.stringify(ex)).join(", ") + "]";
fs.writeFileSync('./data.csv', stringify([["Examples"], ...examples.map(ex => [ex])]))
// fs.writeFileSync('./features_labeling.csv', stringify([tableLabels, ...examples.map(ex => [ex, ...Array(features.length).fill(false)])]))