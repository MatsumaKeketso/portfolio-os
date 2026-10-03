# Window Lab

The isolated `/window-lab` route explores a spatial window model using rectangles, without replacing production Window positioning, resizing, or application state.

## OS Entry And Return

Archive includes a Window lab entry card below Info, anchored above its sidebar footer when space allows and scrollable with the sidebar on smaller windows. Entry and Back use same-origin History navigation without a document reload. Browser back/forward also update the route. A visited desktop stays mounted, hidden and inert during lab visits, preserving open windows and Archive location. Direct lab entry followed by Back still uses the normal OS boot/lock flow; authentication is not bypassed. Lab window state resets on re-entry while saved threshold preferences persist.

## Deliberate Docking On Both Sides

Both sides now require pointer release in the outer 18px strip. Left-side geometry no longer triggers docking; its 8px overhang cap and dock-aware content inset remain. This supersedes all earlier content/visibility-triggered docking rules. The Info panel uses an open-book metaphor and a concrete note/files/timeline example to explain the alternative window interaction and spatial-memory exploration without claiming measured benefits.

## Deliberate Right Docking Revision

Right docking now commits only when the pointer is released in the outer 18px strip. Header visibility and occupied-rail checks no longer arm right docking; this supersedes earlier 220px/284px release thresholds. A compact window may remain floating at the protected visible-header limit and be re-grabbed for a deliberate edge release. Left content-aware docking remains unchanged.

The launcher Info button opens the study's purpose and research questions. Recent-file rows use clear type metadata, stable icon tiles, selection feedback and scroll access to every matching file. Compact headings retain the active location instead of mislabelling filtered content as Recent.

## Rich Content / Header Visibility Revision

Archive is now labelled File Explorer (its internal sample ID remains `archive`). Its full view includes location filters, search, list/grid views, storage usage, artwork and file metadata. Compact content keeps recent file actions. Timeline has activity metrics, a connected event list, source details and timestamps, reduced to two recent events in compact mode. Notes keeps a journal header, shared editable draft and word count. File navigation state survives full/compact switches but resets on docking/closing; the Notes draft remains owned by the lab.

Floating windows and resizing now have a 320px/240px minimum, reduced only when the viewport cannot fit it. The header identity reserves 180px and the right edge retains a 220px visible header region. Controls no longer translate over the title; they may leave the viewport. Release docks before less than 220px of header remains (284px with an occupied right rail). This supersedes the older control-sticky and 120px visibility rules below. Unstick settings remain independent of shrink geometry.

## Asymmetric Edge Revision

Left and right desktop zone widths are now independently adjustable (20-80% of their respective half-stage). Existing symmetric preferences migrate to both sides. Corner resize marks are hidden; pointer hit areas and keyboard resizing remain.

Left overhang is capped at 8px. Proposed movement beyond that limit arms docking, committed on release, rather than leaving a clipped floating window. Content and identity receive an inset when left dock icons overlap their vertical area. This is geometry-aware protection for the left-aligned sample content, not semantic analysis of production apps.

Right controls shift inward during overhang. When less than 120px remains visible (184px with a dock icon alongside the header), release docks the window before resting controls become inaccessible. The outer 18px pointer strip still arms docking on either side. Live dragging remains immediate; settled docking retains its transition.

Unstick guides mark the moving icon centre, not the cursor: an icon initially centred 32px from the edge needs 68px inward movement to cross a 100px boundary, regardless of grab location. Settings use restrained sliders and an icon-only reset. Earlier symmetric/overhang descriptions below are superseded by this revision.

The floating launcher replaces the top header. Start lists Archive, Notes, and Timeline with Open/Docked/Closed status; the three app shortcuts open or restore one instance at centre. Close removes a window and its edge icon; relaunch starts a fresh geometry while the sample Notes draft remains in lab memory. Other Start entries are clearly labelled samples.

Settings exposes unstick distance (70-180px), desktop zone width (20-80%), and threshold visibility. Guides mark the central full-size zone, both unstick boundaries, the 18px dock strips, and the active scale coordinate. A wider desktop zone delays shrinking. Values save under `genos.window-lab.settings.v1` in localStorage; malformed values fall back safely. Reset windows does not erase tuned settings. These are per-device experimental values, not production defaults.

- Centre: a normal-size floating window, draggable from non-control surfaces. The middle 50% of the stage is a full-scale free-movement zone.
- Move beyond the central zone: smooth symmetric shrinking in the outer quarters. Below 65% scale, switch to a compact content variant; return to the full variant above 72% to prevent boundary flicker. Archive shows recent files instead of folders, Timeline shows the latest activity, and Notes keeps the same editable draft.
- Scaling follows horizontal pointer displacement from the captured scale position, so re-grabbing off-centre does not immediately shrink the window. The relative grab point stays under the pointer as dimensions change. Floating windows may overhang the sides while retaining a reachable portion, rather than snapping inward to keep their entire rectangle inside the stage. A compact window may sit near the edge behind docked icons without being iconified.
- Release the pointer within the outer 18px of a side to dock. The armed window receives a brand border before release. Docking/undocking geometry transitions over 320ms, with an icon fade; live drag and resize remain immediate. Reduced-motion preferences disable transition duration. Keyboard movement does not automatically dock: Enter commits docking when the window reaches the outer strip.
- Edge icons retain their edge during vertical movement and occupy separate 60px slots. Click opens at centre; Up/Down keys reposition dock icons.
- Pull inward past the configurable unstick distance (100px initially): return to floating mode. The separate snap and release distances provide hysteresis.
- Maximize and Restore are explicit controls; restore retains previous floating coordinates.
- All four corners resize floating windows and widgets independently in width and height. Pointer capture prevents losing the resize at the boundary; arrow keys on a focused corner provide equivalent resizing. The opposite corner stays anchored, and dimensions remain bounded by the stage. User sizing survives dragging, docking, and maximize/restore.
- Reset restores the three sample windows. Changes are local to the lab and are not persisted.

Tests: `node --test scripts/window-lab.test.mjs` covers the central scale plateau, threshold continuity, re-grab scale stability, grab-point anchoring, scale symmetry, snap/release thresholds, dock collision spacing, variant hysteresis, four-corner anchoring, and resize bounds. The content is sample data, not production Archive or Timeline data. Touch-device ergonomics and production window integration remain future acceptance work.

Separately, the production desktop now starts with Timeline hidden and exposes its existing PanelRight icon beside Widgets. Archive folder tiles use square geometry and a smaller canvas to avoid clipping.
