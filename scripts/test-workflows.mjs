import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import yaml from 'js-yaml';

const loadWorkflow = (path) => yaml.load(readFileSync(path, 'utf8'), { schema: yaml.JSON_SCHEMA });
const findStep = (job, action) => job.steps.find((step) => step.uses?.startsWith(`${action}@`));
const assertPinnedActions = (workflow) => {
  for (const job of Object.values(workflow.jobs)) {
    for (const step of job.steps ?? []) {
      if (step.uses && !step.uses.startsWith('./')) {
        assert.match(step.uses, /^[^@]+@[0-9a-f]{40}$/, `${step.uses} must be pinned to a full commit SHA`);
      }
    }
  }
};
const assertDoesNotBypassFailure = (subject, message, allowedCondition) => {
  assert.equal(subject?.['continue-on-error'] ?? false, false, `${message} must fail closed`);
  assert.equal(
    subject?.if,
    allowedCondition,
    `${message} must not introduce a condition that can bypass failed dependencies`
  );
};

const ci = loadWorkflow('.github/workflows/actions.yaml');
const manualDeploy = loadWorkflow('.github/workflows/deploy.yml');
const productionCondition = "github.event_name == 'push' && github.ref == 'refs/heads/main'";

assert.equal(ci.name, 'CI');
assert.deepEqual(ci.on.pull_request.branches, ['main']);
assert.deepEqual(ci.on.push.branches, ['main']);

assertDoesNotBypassFailure(ci.jobs.check, 'CI Check job');
const checkStep = ci.jobs.check.steps.find((step) => step.name === 'Run checks');
assert.ok(checkStep, 'CI Check must run the project quality gate');
assert.equal(checkStep.run, 'pnpm run check');
assertDoesNotBypassFailure(checkStep, 'CI quality gate step');

assert.equal(ci.jobs.build.needs, 'check');
assertDoesNotBypassFailure(ci.jobs.build, 'CI Build job');
const productionBuildStep = ci.jobs.build.steps.find((step) => step.name === 'Build and validate application');
assert.ok(productionBuildStep, 'CI Build must validate the application');
assertDoesNotBypassFailure(productionBuildStep, 'CI build validation step');
assert.equal(productionBuildStep.run, 'pnpm run build');
assert.equal(productionBuildStep.env.PUBLIC_SITE_URL, 'https://apps.gorani.me');
assert.equal(productionBuildStep.env.PUBLIC_BASE_PATH, '/');
const pagesArtifactStep = findStep(ci.jobs.build, 'actions/upload-pages-artifact');
assert.ok(pagesArtifactStep, 'CI Build must upload a GitHub Pages artifact');
assertDoesNotBypassFailure(pagesArtifactStep, 'CI Pages artifact upload step', productionCondition);
assert.equal(pagesArtifactStep.if, productionCondition);
assert.equal(pagesArtifactStep.with.path, 'dist');
assert.ok(
  ci.jobs.build.steps.indexOf(pagesArtifactStep) > ci.jobs.build.steps.indexOf(productionBuildStep),
  'CI must validate the site before uploading its Pages artifact'
);

const productionDeploy = ci.jobs.deploy;
assertDoesNotBypassFailure(productionDeploy, 'CI Deploy job', productionCondition);
assert.equal(productionDeploy.needs, 'build');
assert.equal(productionDeploy.if, productionCondition);
assert.equal(productionDeploy.concurrency.group, 'pages');
assert.equal(productionDeploy.concurrency['cancel-in-progress'], false);
assert.equal(productionDeploy.permissions.pages, 'write');
assert.equal(productionDeploy.permissions['id-token'], 'write');
assert.equal(productionDeploy.environment.name, 'github-pages');
const productionDeployStep = findStep(productionDeploy, 'actions/deploy-pages');
assert.ok(productionDeployStep, 'CI must deploy the uploaded Pages artifact');
assertDoesNotBypassFailure(productionDeployStep, 'CI Pages deployment step');

assert.equal(manualDeploy.name, 'Manually deploy to GitHub Pages');
assert.equal(manualDeploy.on, 'workflow_dispatch');
assert.equal(manualDeploy.concurrency.group, 'pages');
assert.equal(manualDeploy.concurrency['cancel-in-progress'], false);
const manualBuildStep = findStep(manualDeploy.jobs.build, 'withastro/action');
assert.ok(manualBuildStep, 'Manual deployment must rebuild, validate, and upload the site');
assertDoesNotBypassFailure(manualDeploy.jobs.build, 'Manual Build job');
assertDoesNotBypassFailure(manualBuildStep, 'Manual build and upload step');
assert.equal(manualBuildStep.with['node-version'], 24);
assert.equal(manualBuildStep.with['build-cmd'], 'pnpm run build');
assert.equal(manualBuildStep.env.PUBLIC_SITE_URL, 'https://apps.gorani.me');
assert.equal(manualBuildStep.env.PUBLIC_BASE_PATH, '/');
assert.equal(manualDeploy.jobs.build.permissions.contents, 'read');
assert.equal(manualDeploy.jobs.deploy.needs, 'build');
assertDoesNotBypassFailure(manualDeploy.jobs.deploy, 'Manual Deploy job');
assert.equal(manualDeploy.jobs.deploy.permissions.pages, 'write');
assert.equal(manualDeploy.jobs.deploy.permissions['id-token'], 'write');
assert.equal(manualDeploy.jobs.deploy.environment.name, 'github-pages');
const manualDeployStep = findStep(manualDeploy.jobs.deploy, 'actions/deploy-pages');
assert.ok(manualDeployStep, 'Manual deployment must deploy its validated Pages artifact');
assertDoesNotBypassFailure(manualDeployStep, 'Manual Pages deployment step');
assertPinnedActions(ci);
assertPinnedActions(manualDeploy);

console.log('GitHub Actions workflow topology validated.');
