import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/windowLab.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { windowScale, contentDockEdge, iconDragCentre, parseLabSettings, dragScalePosition, grabbedPosition, retainedDockEdge, dockSlots, resizeRect, compactVariant, releaseDockEdge } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('both sides require deliberate release in the outer strip', () => {
  assert.equal(contentDockEdge(150,1000),null);
  assert.equal(contentDockEdge(19,1000),null);
  assert.equal(contentDockEdge(18,1000),'left');
  assert.equal(contentDockEdge(981,1000),null);
  assert.equal(contentDockEdge(982,1000),'right');
});
test('unstick boundary follows icon centre displacement on either edge', () => {
  assert.equal(retainedDockEdge(iconDragCentre('left',67,1000),1000,'left',100),'left');
  assert.equal(retainedDockEdge(iconDragCentre('left',68,1000),1000,'left',100),null);
  assert.equal(retainedDockEdge(iconDragCentre('right',-68,1000),1000,'right',100),null);
});
test('left and right scaling thresholds are independent', () => {
  assert.equal(windowScale(200,1000,80,20),1);
  assert.ok(windowScale(800,1000,80,20)<1);
});
test('desktop width changes the shrinking boundary', () => {
  assert.equal(windowScale(300,1000,50),1);
  assert.ok(windowScale(300,1000,20)<1);
  assert.equal(windowScale(300,1000,80),1);
});
test('saved settings round-trip and malformed values fall back safely', () => {
  const settings = {releaseDistance:140,desktopWidth:65,leftWidth:70,rightWidth:40,showZones:false};
  assert.deepEqual(parseLabSettings(JSON.stringify(settings)),settings);
  assert.deepEqual(parseLabSettings('invalid'),{releaseDistance:100,desktopWidth:50,leftWidth:50,rightWidth:50,showZones:true});
  assert.deepEqual(parseLabSettings('{"releaseDistance":999,"desktopWidth":-5}'),{releaseDistance:180,desktopWidth:20,leftWidth:20,rightWidth:20,showZones:true});
  assert.equal(parseLabSettings('{"desktopWidth":65}').leftWidth,65);
});
test('central half stays full size and edge shrinking begins continuously', () => {
  for (const x of [250, 300, 500, 700, 750]) assert.equal(windowScale(x, 1000), 1);
  assert.ok(windowScale(249, 1000) > 0.9999);
  assert.ok(windowScale(100, 1000) < windowScale(200, 1000));
});
test('re-grabbing preserves scale and central pointer deltas do not shrink', () => {
  assert.equal(dragScalePosition(0.5, 0, 1000), 0.5);
  assert.equal(windowScale(dragScalePosition(0.5, 100, 1000) * 1000, 1000), 1);
  assert.equal(dragScalePosition(0.1, -200, 1000), 0);
});
test('grab point remains under the pointer as dimensions change', () => {
  for (const fraction of [0.1, 0.5, 0.9]) {
    for (const extent of [220, 400, 820]) {
      const centre = grabbedPosition(300, fraction, extent);
      assert.ok(Math.abs(centre - extent / 2 + fraction * extent - 300) < 0.00001);
      assert.equal(grabbedPosition(380, fraction, extent) - centre, 80);
    }
  }
});
test('centre is full size, both edges shrink symmetrically', () => {
  assert.equal(windowScale(500, 1000), 1);
  assert.equal(windowScale(200, 1000), windowScale(800, 1000));
  assert.ok(windowScale(0, 1000) < windowScale(200, 1000));
});
test('moving retains an existing dock until unstick but never creates a new dock', () => {
  assert.equal(retainedDockEdge(40, 1000, null, 100), null);
  assert.equal(retainedDockEdge(80, 1000, 'left', 100), 'left');
  assert.equal(retainedDockEdge(110, 1000, 'left', 100), null);
  assert.equal(retainedDockEdge(930, 1000, 'right', 100), 'right');
});
test('edge slots remain separated and inside the stage', () => {
  const slots = Object.values(dockSlots([{id:'a',y:580},{id:'b',y:580},{id:'c',y:580}], 600));
  assert.ok(slots[0] >= 36);
  assert.ok(slots[2] <= 564);
  assert.ok(slots[1] - slots[0] >= 60);
  assert.ok(slots[2] - slots[1] >= 60);
});
test('content variants use hysteresis instead of flickering at a single threshold', () => {
  assert.equal(compactVariant(0.64, false), true);
  assert.equal(compactVariant(0.68, true), true);
  assert.equal(compactVariant(0.68, false), false);
  assert.equal(compactVariant(0.73, true), false);
});
test('each resize corner preserves the opposite corner and permits independent dimensions', () => {
  const rect = {left:100,top:100,width:400,height:300};
  const bounds = {width:1000,height:800};
  assert.deepEqual(resizeRect(rect,'se',100,-50,bounds),{left:100,top:100,width:500,height:250});
  assert.deepEqual(resizeRect(rect,'nw',50,20,bounds),{left:150,top:120,width:350,height:280});
  assert.deepEqual(resizeRect(rect,'ne',50,20,bounds),{left:100,top:120,width:450,height:280});
  assert.deepEqual(resizeRect(rect,'sw',50,20,bounds),{left:150,top:100,width:350,height:320});
});
test('resize respects minimum dimensions and stage limits', () => {
  const rect = {left:100,top:100,width:400,height:300};
  const bounds = {width:1000,height:800};
  assert.deepEqual(resizeRect(rect,'se',-1000,-1000,bounds),{left:100,top:100,width:320,height:240});
  const large = resizeRect(rect,'se',2000,2000,bounds);
  assert.equal(large.left + large.width,992);
  assert.equal(large.top + large.height,792);
});
test('only a pointer release in the outer strip commits docking', () => {
  assert.equal(releaseDockEdge(18,1000),'left');
  assert.equal(releaseDockEdge(19,1000),null);
  assert.equal(releaseDockEdge(60,1000),null);
  assert.equal(releaseDockEdge(981,1000),null);
  assert.equal(releaseDockEdge(982,1000),'right');
});
