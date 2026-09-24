---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'


# Excalidraw Data

## Text Elements
How the second brain works ^titleTop

Capture may be slow; answering must be cheap — 30–50× cheaper than loading the sources ^subTitle

1 — Capture ^zoneCapT

You,
in Obsidian ^L1gsg4Us

Daily note
raw/daily/YYYY-MM-DD.md ^gmgebMFt

PDF, DOCX, URL
raw/ ^Wf7oEHE4

Drawing
Excalidraw/<topic>/
vault-excalidraw skill ^dbrmhAvD

A capture left in raw/ warns the build
until you type /vault-compile (D68) ^capNote1

2 — The graph: wiki/ ^zoneWikT

/vault-compile
verbatim → logs
facts → nodes ^KQdTTZFP

nodes, one per concept
hub · detail · log
person · idea · decision ^9aExlUNd

Answer surface — capped
8 bullets · 1500 bytes ^9cxnyEUp

Body — uncapped
full detail, exact lines ^AGrMWUcL

Figures
images and live drawings,
transcribed ^gqeRYSGE

One concept per node,
with aliases for how
you would ask, and
volatile status in one
## Status Log ^wikiNote

3 — Build ^zoneBldT

node tools/build-index.js
builder AND validator ^KPMwLiuP

Runs in the same step that writes content.
A stale index is the worst failure mode: it
routes queries down the expensive path. ^bldNote1

Refuses an oversized answer surface, a broken
link, a flat tag, an untranscribed drawing,
a rewritten log entry, a corrected claim,
an unlinked person, a drifted setting. ^bldNote2

4 — The index layer ^zoneIdxT

_index.tsv — route ^TRtzPIfB

_cards.tsv — answer ^zkQrUvhc

_sections.tsv — line ranges ^hDE4qWUa

_links.tsv — edges ^YgQOtgqS

_mentions.tsv — people ^CsH5ye20

profile/now.md — status ^2dVdQ9xd

Sections, edges and mention rows —
every one generated, none written by hand,
all grepped and never read whole. ^idxNote1

Now is built from the open Status Logs,
so the status card cannot drift. ^idxNote2

5 — Answering a question ^zoneAskT

A question ^IgEU1wex

L0 — route
grep _index.tsv · ~50–180 tokens ^TsFthM8O

L1 — card
one _cards.tsv row · ~220 tokens ^brb8naMz

L2 — section
sed an exact range · ~300–600 ^DyUJ0ZJF

L3 — the whole node (rare) ^GPEBoQ0h

Side paths:
_links for neighbours,
_mentions for a person
over time, Now for
"what's my status?" ^askNote1

Stop at the first rung that answers.
Target: 30–50× cheaper than loading the sources. ^askNote2

Guards — nothing ships unchecked ^zoneGrdT

node tools/selftest.js
regression tests — the
tooling itself is sound ^q1dPttgq

tools/probes.json
routing probes · must-route
fences, replayed by the build ^Cn1QE8ze

/vault-audit · /vault-deep-audit
node tools/audit.js
11 sections, on request ^6FIRLFZZ

tools/DEFECTS.md
D01–D78 inherited, each
with a guard in code ^vfV3esKW

git — private repo
one commit a session
Obsidian setup versioned ^HNeWn1Xw

Nothing is committed until the self-test and the build pass;
the audit runs when you type /vault-audit. Every defect is fixed,
root-caused, guarded in code, written into CLAUDE.md and ledgered. ^grdNote1

The audit replays the benchmark queries and fails if answering stops being 30× cheaper than the sources. ^grdNote2

NotebookLM — grounded second reader
triage the batch · verify the compile · never a source (D74) ^jPi1MvNT

verify ^TY6aILcy

triage ^UaqsPp3l

Dashed border — a skill only you start, by typing it:
/vault-compile, /vault-audit, /vault-deep-audit.
Claude may start vault-excalidraw on its own. Captures,
the build and the self-test are never gated. ^skLegend

%%
## Drawing
```json
{
	"type": "excalidraw",
	"version": 2,
	"source": "https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag/2.27.3",
	"elements": [
		{
			"id": "titleTop",
			"type": "text",
			"x": 0,
			"y": 0,
			"width": 377.77587890625,
			"height": 35,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a0",
			"roundness": null,
			"seed": 722025292,
			"version": 2,
			"versionNonce": 670448500,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671362124,
			"link": null,
			"locked": false,
			"text": "How the second brain works",
			"rawText": "How the second brain works",
			"fontSize": 28,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "How the second brain works",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "subTitle",
			"type": "text",
			"x": 0,
			"y": 44,
			"width": 714.431396484375,
			"height": 20,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a1",
			"roundness": null,
			"seed": 1370746740,
			"version": 2,
			"versionNonce": 640968140,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671362124,
			"link": null,
			"locked": false,
			"text": "Capture may be slow; answering must be cheap — 30–50× cheaper than loading the sources",
			"rawText": "Capture may be slow; answering must be cheap — 30–50× cheaper than loading the sources",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Capture may be slow; answering must be cheap — 30–50× cheaper than loading the sources",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "zoneCap",
			"type": "rectangle",
			"x": 0,
			"y": 120,
			"width": 640,
			"height": 620,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "#e9ecef",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 0,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a2",
			"roundness": {
				"type": 3
			},
			"seed": 1197208012,
			"version": 32,
			"versionNonce": 1888756362,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789744367582,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "zoneCapT",
			"type": "text",
			"x": 20,
			"y": 136,
			"width": 118.679931640625,
			"height": 25,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a3",
			"roundness": null,
			"seed": 1642979572,
			"version": 2,
			"versionNonce": 951962700,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671362124,
			"link": null,
			"locked": false,
			"text": "1 — Capture",
			"rawText": "1 — Capture",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "1 — Capture",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "youShape",
			"type": "ellipse",
			"x": 40,
			"y": 240,
			"width": 230,
			"height": 110,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "#ffd8a8",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a4",
			"roundness": null,
			"seed": 1695799372,
			"version": 7,
			"versionNonce": 1837958744,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "L1gsg4Us"
				},
				{
					"id": "avd",
					"type": "arrow"
				},
				{
					"id": "avc",
					"type": "arrow"
				},
				{
					"id": "avr",
					"type": "arrow"
				}
			],
			"updated": 1789712821315,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "L1gsg4Us",
			"type": "text",
			"x": 113.16004180908203,
			"y": 275,
			"width": 83.67991638183594,
			"height": 40,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a4V",
			"roundness": null,
			"seed": 1133738228,
			"version": 8,
			"versionNonce": 1270581337,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789712821321,
			"link": null,
			"locked": false,
			"text": "You,\nin Obsidian",
			"rawText": "You,\nin Obsidian",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "youShape",
			"originalText": "You,\nin Obsidian",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "daily",
			"type": "rectangle",
			"x": 330,
			"y": 190,
			"width": 290,
			"height": 90,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "#ffd8a8",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a5",
			"roundness": {
				"type": 3
			},
			"seed": 149791348,
			"version": 5,
			"versionNonce": 1256321293,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "gmgebMFt"
				},
				{
					"id": "avd",
					"type": "arrow"
				},
				{
					"id": "adc",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "gmgebMFt",
			"type": "text",
			"x": 374.48009490966797,
			"y": 215,
			"width": 201.03981018066406,
			"height": 40,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a5V",
			"roundness": null,
			"seed": 1377843828,
			"version": 4,
			"versionNonce": 1204962243,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "Daily note\nraw/daily/YYYY-MM-DD.md",
			"rawText": "Daily note\nraw/daily/YYYY-MM-DD.md",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "daily",
			"originalText": "Daily note\nraw/daily/YYYY-MM-DD.md",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "docs",
			"type": "rectangle",
			"x": 330,
			"y": 330,
			"width": 290,
			"height": 90,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "#ffd8a8",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a6",
			"roundness": {
				"type": 3
			},
			"seed": 716492,
			"version": 10,
			"versionNonce": 1495304202,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "Wf7oEHE4"
				},
				{
					"id": "avc",
					"type": "arrow"
				},
				{
					"id": "adoc",
					"type": "arrow"
				},
				{
					"id": "anlmt",
					"type": "arrow"
				}
			],
			"updated": 1789744367583,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "Wf7oEHE4",
			"type": "text",
			"x": 409.6720504760742,
			"y": 355,
			"width": 130.65589904785156,
			"height": 40,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a6V",
			"roundness": null,
			"seed": 1150864372,
			"version": 5,
			"versionNonce": 328656195,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"text": "PDF, DOCX, URL\nraw/",
			"rawText": "PDF, DOCX, URL\nraw/",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "docs",
			"originalText": "PDF, DOCX, URL\nraw/",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "drawfile",
			"type": "rectangle",
			"x": 330,
			"y": 470,
			"width": 290,
			"height": 90,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "#ffd8a8",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a7",
			"roundness": {
				"type": 3
			},
			"seed": 226046964,
			"version": 6,
			"versionNonce": 1139859663,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "dbrmhAvD"
				},
				{
					"id": "avr",
					"type": "arrow"
				},
				{
					"id": "adrw",
					"type": "arrow"
				}
			],
			"updated": 1789829869667,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "dbrmhAvD",
			"type": "text",
			"x": 395.7920837402344,
			"y": 485,
			"width": 158.41583251953125,
			"height": 60,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a7V",
			"roundness": null,
			"seed": 1292053876,
			"version": 5,
			"versionNonce": 1717421257,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789829869667,
			"link": null,
			"locked": false,
			"text": "Drawing\nExcalidraw/<topic>/\nvault-excalidraw skill",
			"rawText": "Drawing\nExcalidraw/<topic>/\nvault-excalidraw skill",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "drawfile",
			"originalText": "Drawing\nExcalidraw/<topic>/\nvault-excalidraw skill",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "capNote1",
			"type": "text",
			"x": 40,
			"y": 620,
			"width": 295.375732421875,
			"height": 40,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a8",
			"roundness": null,
			"seed": 148583756,
			"version": 4,
			"versionNonce": 1609581691,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789829869668,
			"link": null,
			"locked": false,
			"text": "A capture left in raw/ warns the build\nuntil you type /vault-compile (D68)",
			"rawText": "A capture left in raw/ warns the build\nuntil you type /vault-compile (D68)",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "A capture left in raw/ warns the build\nuntil you type /vault-compile (D68)",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "zoneWiki",
			"type": "rectangle",
			"x": 720,
			"y": 120,
			"width": 800,
			"height": 620,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "#e9ecef",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 0,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "a9",
			"roundness": {
				"type": 3
			},
			"seed": 1838585204,
			"version": 2,
			"versionNonce": 1373446092,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671362124,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "zoneWikT",
			"type": "text",
			"x": 740,
			"y": 136,
			"width": 206.83987426757812,
			"height": 25,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aA",
			"roundness": null,
			"seed": 1289661388,
			"version": 2,
			"versionNonce": 501125876,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671362124,
			"link": null,
			"locked": false,
			"text": "2 — The graph: wiki/",
			"rawText": "2 — The graph: wiki/",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "2 — The graph: wiki/",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "compile",
			"type": "rectangle",
			"x": 750,
			"y": 200,
			"width": 340,
			"height": 100,
			"angle": 0,
			"strokeColor": "#9c36b5",
			"backgroundColor": "#eebefa",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aB",
			"roundness": {
				"type": 3
			},
			"seed": 1988871924,
			"version": 8,
			"versionNonce": 1091131317,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "KQdTTZFP"
				},
				{
					"id": "adc",
					"type": "arrow"
				},
				{
					"id": "adoc",
					"type": "arrow"
				},
				{
					"id": "ack",
					"type": "arrow"
				},
				{
					"id": "anlmv",
					"type": "arrow"
				}
			],
			"updated": 1789829869664,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "KQdTTZFP",
			"type": "text",
			"x": 857.6960601806641,
			"y": 220,
			"width": 124.60787963867188,
			"height": 60,
			"angle": 0,
			"strokeColor": "#9c36b5",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aBV",
			"roundness": null,
			"seed": 1822777076,
			"version": 5,
			"versionNonce": 1134710636,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789829869666,
			"link": null,
			"locked": false,
			"text": "/vault-compile\nverbatim → logs\nfacts → nodes",
			"rawText": "/vault-compile\nverbatim → logs\nfacts → nodes",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "compile",
			"originalText": "/vault-compile\nverbatim → logs\nfacts → nodes",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "kinds",
			"type": "rectangle",
			"x": 1150,
			"y": 190,
			"width": 340,
			"height": 120,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "#a5d8ff",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aC",
			"roundness": {
				"type": 3
			},
			"seed": 1580159564,
			"version": 9,
			"versionNonce": 577501257,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "9aExlUNd"
				},
				{
					"id": "ack",
					"type": "arrow"
				},
				{
					"id": "aks",
					"type": "arrow"
				},
				{
					"id": "akb",
					"type": "arrow"
				},
				{
					"id": "akbld",
					"type": "arrow"
				}
			],
			"updated": 1789712821321,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "9aExlUNd",
			"type": "text",
			"x": 1230.576057434082,
			"y": 220,
			"width": 178.84788513183594,
			"height": 60,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aCV",
			"roundness": null,
			"seed": 201678964,
			"version": 6,
			"versionNonce": 769717875,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789712821321,
			"link": null,
			"locked": false,
			"text": "nodes, one per concept\nhub · detail · log\nperson · idea · decision",
			"rawText": "nodes, one per concept\nhub · detail · log\nperson · idea · decision",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "kinds",
			"originalText": "nodes, one per concept\nhub · detail · log\nperson · idea · decision",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "surface",
			"type": "rectangle",
			"x": 750,
			"y": 370,
			"width": 340,
			"height": 100,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "#b2f2bb",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aD",
			"roundness": {
				"type": 3
			},
			"seed": 1558104180,
			"version": 7,
			"versionNonce": 2080538435,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "9cxnyEUp"
				},
				{
					"id": "aks",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "9cxnyEUp",
			"type": "text",
			"x": 820.3600692749023,
			"y": 400,
			"width": 199.2798614501953,
			"height": 40,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aDV",
			"roundness": null,
			"seed": 317272564,
			"version": 4,
			"versionNonce": 1796486829,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "Answer surface — capped\n8 bullets · 1500 bytes",
			"rawText": "Answer surface — capped\n8 bullets · 1500 bytes",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "surface",
			"originalText": "Answer surface — capped\n8 bullets · 1500 bytes",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "body",
			"type": "rectangle",
			"x": 1150,
			"y": 370,
			"width": 340,
			"height": 100,
			"angle": 0,
			"strokeColor": "#0c8599",
			"backgroundColor": "#99e9f2",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aE",
			"roundness": {
				"type": 3
			},
			"seed": 2074552524,
			"version": 5,
			"versionNonce": 1017629315,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "AGrMWUcL"
				},
				{
					"id": "akb",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "AGrMWUcL",
			"type": "text",
			"x": 1235.9360885620117,
			"y": 400,
			"width": 168.12782287597656,
			"height": 40,
			"angle": 0,
			"strokeColor": "#0c8599",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aEV",
			"roundness": null,
			"seed": 5690228,
			"version": 4,
			"versionNonce": 678532771,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "Body — uncapped\nfull detail, exact lines",
			"rawText": "Body — uncapped\nfull detail, exact lines",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "body",
			"originalText": "Body — uncapped\nfull detail, exact lines",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "figures",
			"type": "rectangle",
			"x": 1150,
			"y": 540,
			"width": 340,
			"height": 100,
			"angle": 0,
			"strokeColor": "#0c8599",
			"backgroundColor": "#99e9f2",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aF",
			"roundness": {
				"type": 3
			},
			"seed": 1414896116,
			"version": 6,
			"versionNonce": 2002807885,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "gqeRYSGE"
				},
				{
					"id": "adrw",
					"type": "arrow"
				},
				{
					"id": "afigb",
					"type": "arrow"
				}
			],
			"updated": 1789691221448,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "gqeRYSGE",
			"type": "text",
			"x": 1224.5840911865234,
			"y": 560,
			"width": 190.83181762695312,
			"height": 60,
			"angle": 0,
			"strokeColor": "#0c8599",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aFV",
			"roundness": null,
			"seed": 43271412,
			"version": 4,
			"versionNonce": 34789645,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "Figures\nimages and live drawings,\ntranscribed",
			"rawText": "Figures\nimages and live drawings,\ntranscribed",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "figures",
			"originalText": "Figures\nimages and live drawings,\ntranscribed",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "wikiNote",
			"type": "text",
			"x": 750,
			"y": 600,
			"width": 172.83189392089844,
			"height": 100,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aG",
			"roundness": null,
			"seed": 2027958092,
			"version": 6,
			"versionNonce": 1824352989,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789712821323,
			"link": null,
			"locked": false,
			"text": "One concept per node,\nwith aliases for how\nyou would ask, and\nvolatile status in one\n## Status Log",
			"rawText": "One concept per node,\nwith aliases for how\nyou would ask, and\nvolatile status in one\n## Status Log",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "One concept per node,\nwith aliases for how\nyou would ask, and\nvolatile status in one\n## Status Log",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "avd",
			"type": "arrow",
			"x": 268.4100253095187,
			"y": 273.73562025446523,
			"width": 55.69274156887536,
			"height": 10.442389044164145,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aQ",
			"roundness": null,
			"seed": 2106090484,
			"version": 8,
			"versionNonce": 1853731651,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221468,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					55.69274156887536,
					-10.442389044164145
				]
			],
			"startBinding": {
				"elementId": "youShape",
				"mode": "orbit",
				"fixedPoint": [
					0.9911443679404823,
					0.3074490830233334
				]
			},
			"endBinding": {
				"elementId": "daily",
				"mode": "orbit",
				"fixedPoint": [
					-0.020335286626227415,
					0.8143692356700121
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "avc",
			"type": "arrow",
			"x": 263.4028160360981,
			"y": 322.1007040090245,
			"width": 60.77632896302987,
			"height": 15.194082240757496,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aR",
			"roundness": null,
			"seed": 1217856844,
			"version": 8,
			"versionNonce": 309533795,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221460,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					60.77632896302987,
					15.194082240757496
				]
			],
			"startBinding": {
				"elementId": "youShape",
				"mode": "orbit",
				"fixedPoint": [
					0.9684207872021009,
					0.7448563205829166
				]
			},
			"endBinding": {
				"elementId": "docs",
				"mode": "orbit",
				"fixedPoint": [
					-0.020071913796110445,
					0.08105318055313357
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "avr",
			"type": "arrow",
			"x": 226.55182502558998,
			"y": 344.19187970509313,
			"width": 174.26635679259195,
			"height": 119.80812029490693,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aS",
			"roundness": null,
			"seed": 1950336372,
			"version": 8,
			"versionNonce": 864834275,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221471,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					174.26635679259195,
					119.80812029490693
				]
			],
			"startBinding": {
				"elementId": "youShape",
				"mode": "orbit",
				"fixedPoint": [
					0.8070289899479791,
					0.9413541730502201
				]
			},
			"endBinding": {
				"elementId": "drawfile",
				"mode": "orbit",
				"fixedPoint": [
					0.2572455275870978,
					-0.03776858819247132
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "adc",
			"type": "arrow",
			"x": 626,
			"y": 240.08988764044946,
			"width": 118.00000000000011,
			"height": 3.9775280898875565,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aT",
			"roundness": null,
			"seed": 1151368140,
			"version": 8,
			"versionNonce": 149290627,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221473,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					118.00000000000011,
					3.9775280898875565
				]
			],
			"startBinding": {
				"elementId": "daily",
				"mode": "orbit",
				"fixedPoint": [
					1.0206779111774875,
					0.5565530315511129
				]
			},
			"endBinding": {
				"elementId": "compile",
				"mode": "orbit",
				"fixedPoint": [
					-0.017637041886680502,
					0.4406753053118635
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "adoc",
			"type": "arrow",
			"x": 625.7764339629516,
			"y": 332.64706911153047,
			"width": 118.44713207409677,
			"height": 33.27166631294858,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aU",
			"roundness": null,
			"seed": 814675700,
			"version": 8,
			"versionNonce": 1127716867,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221462,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					118.44713207409677,
					-33.27166631294858
				]
			],
			"startBinding": {
				"elementId": "docs",
				"mode": "orbit",
				"fixedPoint": [
					1.0199187378032815,
					0.029411879017005226
				]
			},
			"endBinding": {
				"elementId": "compile",
				"mode": "orbit",
				"fixedPoint": [
					-0.01698951165574004,
					0.9937540279858189
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "adrw",
			"type": "arrow",
			"x": 626,
			"y": 528.4023668639054,
			"width": 518,
			"height": 45.976331360946574,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aV",
			"roundness": null,
			"seed": 490152524,
			"version": 8,
			"versionNonce": 1229534755,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221474,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					518,
					45.976331360946574
				]
			],
			"startBinding": {
				"elementId": "drawfile",
				"mode": "orbit",
				"fixedPoint": [
					1.0206086382771407,
					0.6488920168642709
				]
			},
			"endBinding": {
				"elementId": "figures",
				"mode": "orbit",
				"fixedPoint": [
					-0.017577956177561138,
					0.34380783570972995
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "ack",
			"type": "arrow",
			"x": 1096,
			"y": 250.01,
			"width": 48,
			"height": 0.0020000000000095497,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aW",
			"roundness": null,
			"seed": 1325135988,
			"version": 8,
			"versionNonce": 1940158915,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221475,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					48,
					0.0020000000000095497
				]
			],
			"startBinding": {
				"elementId": "compile",
				"mode": "orbit",
				"fixedPoint": [
					1.0176470588235293,
					0.5001
				]
			},
			"endBinding": {
				"elementId": "kinds",
				"mode": "orbit",
				"fixedPoint": [
					-0.01764705882352941,
					0.5001
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "aks",
			"type": "arrow",
			"x": 1167.8724208829615,
			"y": 314.6525465529969,
			"width": 116.10771500060855,
			"height": 49.34745344700309,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aX",
			"roundness": null,
			"seed": 691337420,
			"version": 8,
			"versionNonce": 1391273219,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221478,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-116.10771500060855,
					49.34745344700309
				]
			],
			"startBinding": {
				"elementId": "kinds",
				"mode": "orbit",
				"fixedPoint": [
					0.06853395265004096,
					1.0195570320172427
				]
			},
			"endBinding": {
				"elementId": "surface",
				"mode": "orbit",
				"fixedPoint": [
					0.8622618951008242,
					-0.0234684384206912
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "akb",
			"type": "arrow",
			"x": 1320.034,
			"y": 316,
			"width": 0,
			"height": 48,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aY",
			"roundness": null,
			"seed": 1800194548,
			"version": 8,
			"versionNonce": 1151831203,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221478,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					0,
					48
				]
			],
			"startBinding": {
				"elementId": "kinds",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					1.05
				]
			},
			"endBinding": {
				"elementId": "body",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					-0.06
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "zoneBld",
			"type": "rectangle",
			"x": 1600,
			"y": 120,
			"width": 470,
			"height": 620,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "#e9ecef",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 0,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aZ",
			"roundness": {
				"type": 3
			},
			"seed": 1054174643,
			"version": 3,
			"versionNonce": 412406301,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671413525,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "zoneBldT",
			"type": "text",
			"x": 1620,
			"y": 136,
			"width": 94.51994323730469,
			"height": 25,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aa",
			"roundness": null,
			"seed": 1439152893,
			"version": 3,
			"versionNonce": 91138611,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671413525,
			"link": null,
			"locked": false,
			"text": "3 — Build",
			"rawText": "3 — Build",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "3 — Build",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "builder",
			"type": "rectangle",
			"x": 1630,
			"y": 250,
			"width": 410,
			"height": 110,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "#a5d8ff",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ab",
			"roundness": {
				"type": 3
			},
			"seed": 400768851,
			"version": 12,
			"versionNonce": 2120551171,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "KPMwLiuP"
				},
				{
					"id": "abi",
					"type": "arrow"
				},
				{
					"id": "akbld",
					"type": "arrow"
				},
				{
					"id": "afigb",
					"type": "arrow"
				}
			],
			"updated": 1789691221448,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "KPMwLiuP",
			"type": "text",
			"x": 1739.1120986938477,
			"y": 285,
			"width": 191.7758026123047,
			"height": 40,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "abV",
			"roundness": null,
			"seed": 669727901,
			"version": 5,
			"versionNonce": 2146224707,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "node tools/build-index.js\nbuilder AND validator",
			"rawText": "node tools/build-index.js\nbuilder AND validator",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "builder",
			"originalText": "node tools/build-index.js\nbuilder AND validator",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "bldNote1",
			"type": "text",
			"x": 1630,
			"y": 560,
			"width": 342.2877197265625,
			"height": 60,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ac",
			"roundness": null,
			"seed": 980505437,
			"version": 5,
			"versionNonce": 199265197,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671484663,
			"link": null,
			"locked": false,
			"text": "Runs in the same step that writes content.\nA stale index is the worst failure mode: it\nroutes queries down the expensive path.",
			"rawText": "Runs in the same step that writes content.\nA stale index is the worst failure mode: it\nroutes queries down the expensive path.",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Runs in the same step that writes content.\nA stale index is the worst failure mode: it\nroutes queries down the expensive path.",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "bldNote2",
			"type": "text",
			"x": 1630,
			"y": 640,
			"width": 367.0077209472656,
			"height": 80,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ad",
			"roundness": null,
			"seed": 1585831155,
			"version": 7,
			"versionNonce": 94809023,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789829869669,
			"link": null,
			"locked": false,
			"text": "Refuses an oversized answer surface, a broken\nlink, a flat tag, an untranscribed drawing,\na rewritten log entry, a corrected claim,\nan unlinked person, a drifted setting.",
			"rawText": "Refuses an oversized answer surface, a broken\nlink, a flat tag, an untranscribed drawing,\na rewritten log entry, a corrected claim,\nan unlinked person, a drifted setting.",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Refuses an oversized answer surface, a broken\nlink, a flat tag, an untranscribed drawing,\na rewritten log entry, a corrected claim,\nan unlinked person, a drifted setting.",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "zoneIdx",
			"type": "rectangle",
			"x": 2150,
			"y": 120,
			"width": 780,
			"height": 620,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "#e9ecef",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 0,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ae",
			"roundness": {
				"type": 3
			},
			"seed": 453566397,
			"version": 5,
			"versionNonce": 1929922893,
			"isDeleted": false,
			"boundElements": [
				{
					"id": "aidxask",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "zoneIdxT",
			"type": "text",
			"x": 2170,
			"y": 136,
			"width": 197.27989196777344,
			"height": 25,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "af",
			"roundness": null,
			"seed": 507758227,
			"version": 3,
			"versionNonce": 1232259901,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671413525,
			"link": null,
			"locked": false,
			"text": "4 — The index layer",
			"rawText": "4 — The index layer",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "4 — The index layer",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "fIndex",
			"type": "rectangle",
			"x": 2180,
			"y": 200,
			"width": 340,
			"height": 80,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "#b2f2bb",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ag",
			"roundness": {
				"type": 3
			},
			"seed": 766500893,
			"version": 3,
			"versionNonce": 1415598867,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "TRtzPIfB"
				}
			],
			"updated": 1789671413525,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "TRtzPIfB",
			"type": "text",
			"x": 2274.3760681152344,
			"y": 230,
			"width": 151.24786376953125,
			"height": 20,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "agV",
			"roundness": null,
			"seed": 737386749,
			"version": 5,
			"versionNonce": 1506684781,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "_index.tsv — route",
			"rawText": "_index.tsv — route",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "fIndex",
			"originalText": "_index.tsv — route",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "fCards",
			"type": "rectangle",
			"x": 2180,
			"y": 310,
			"width": 340,
			"height": 80,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "#b2f2bb",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ah",
			"roundness": {
				"type": 3
			},
			"seed": 768834611,
			"version": 5,
			"versionNonce": 576931267,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "zkQrUvhc"
				},
				{
					"id": "abi",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "zkQrUvhc",
			"type": "text",
			"x": 2268.1840744018555,
			"y": 340,
			"width": 163.63185119628906,
			"height": 20,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ahV",
			"roundness": null,
			"seed": 1848670557,
			"version": 5,
			"versionNonce": 352356835,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "_cards.tsv — answer",
			"rawText": "_cards.tsv — answer",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "fCards",
			"originalText": "_cards.tsv — answer",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "fSects",
			"type": "rectangle",
			"x": 2180,
			"y": 420,
			"width": 340,
			"height": 80,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "#b2f2bb",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ai",
			"roundness": {
				"type": 3
			},
			"seed": 1750586493,
			"version": 3,
			"versionNonce": 2041215155,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "hDE4qWUa"
				}
			],
			"updated": 1789671413525,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "hDE4qWUa",
			"type": "text",
			"x": 2242.872100830078,
			"y": 450,
			"width": 214.25579833984375,
			"height": 20,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aiV",
			"roundness": null,
			"seed": 401819069,
			"version": 5,
			"versionNonce": 546290125,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "_sections.tsv — line ranges",
			"rawText": "_sections.tsv — line ranges",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "fSects",
			"originalText": "_sections.tsv — line ranges",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "fLinks",
			"type": "rectangle",
			"x": 2560,
			"y": 200,
			"width": 340,
			"height": 80,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "#b2f2bb",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "aj",
			"roundness": {
				"type": 3
			},
			"seed": 1226538451,
			"version": 3,
			"versionNonce": 652009469,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "YgQOtgqS"
				}
			],
			"updated": 1789671413525,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "YgQOtgqS",
			"type": "text",
			"x": 2656.8160705566406,
			"y": 230,
			"width": 146.36785888671875,
			"height": 20,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ajV",
			"roundness": null,
			"seed": 744326685,
			"version": 5,
			"versionNonce": 1018910083,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "_links.tsv — edges",
			"rawText": "_links.tsv — edges",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "fLinks",
			"originalText": "_links.tsv — edges",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "fMents",
			"type": "rectangle",
			"x": 2560,
			"y": 310,
			"width": 340,
			"height": 80,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "#b2f2bb",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ak",
			"roundness": {
				"type": 3
			},
			"seed": 113392861,
			"version": 3,
			"versionNonce": 1776216659,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "CsH5ye20"
				}
			],
			"updated": 1789671413525,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "CsH5ye20",
			"type": "text",
			"x": 2638.2800827026367,
			"y": 340,
			"width": 183.43983459472656,
			"height": 20,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "akV",
			"roundness": null,
			"seed": 1314962045,
			"version": 5,
			"versionNonce": 2138109997,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "_mentions.tsv — people",
			"rawText": "_mentions.tsv — people",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "fMents",
			"originalText": "_mentions.tsv — people",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "fNow",
			"type": "rectangle",
			"x": 2560,
			"y": 420,
			"width": 340,
			"height": 80,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "#b2f2bb",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "al",
			"roundness": {
				"type": 3
			},
			"seed": 1798458227,
			"version": 3,
			"versionNonce": 1469700189,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "2dVdQ9xd"
				}
			],
			"updated": 1789671413525,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "2dVdQ9xd",
			"type": "text",
			"x": 2633.8000869750977,
			"y": 450,
			"width": 192.3998260498047,
			"height": 20,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "alV",
			"roundness": null,
			"seed": 1186882269,
			"version": 5,
			"versionNonce": 643542307,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "profile/now.md — status",
			"rawText": "profile/now.md — status",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "fNow",
			"originalText": "profile/now.md — status",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "idxNote1",
			"type": "text",
			"x": 2180,
			"y": 545,
			"width": 336.03179931640625,
			"height": 60,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "am",
			"roundness": null,
			"seed": 1350605117,
			"version": 7,
			"versionNonce": 683451590,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789712821323,
			"link": null,
			"locked": false,
			"text": "Sections, edges and mention rows —\nevery one generated, none written by hand,\nall grepped and never read whole.",
			"rawText": "Sections, edges and mention rows —\nevery one generated, none written by hand,\nall grepped and never read whole.",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Sections, edges and mention rows —\nevery one generated, none written by hand,\nall grepped and never read whole.",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "idxNote2",
			"type": "text",
			"x": 2180,
			"y": 660,
			"width": 312.9436950683594,
			"height": 40,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "an",
			"roundness": null,
			"seed": 1751016723,
			"version": 5,
			"versionNonce": 864013299,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671614154,
			"link": null,
			"locked": false,
			"text": "Now is built from the open Status Logs,\nso the status card cannot drift.",
			"rawText": "Now is built from the open Status Logs,\nso the status card cannot drift.",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Now is built from the open Status Logs,\nso the status card cannot drift.",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "abi",
			"type": "arrow",
			"x": 2046,
			"y": 323.43689320388347,
			"width": 128,
			"height": 11.18446601941747,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "ay",
			"roundness": null,
			"seed": 282108531,
			"version": 8,
			"versionNonce": 1219559395,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221481,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					128,
					11.18446601941747
				]
			],
			"startBinding": {
				"elementId": "builder",
				"mode": "orbit",
				"fixedPoint": [
					1.014578598173443,
					0.6675900288843779
				]
			},
			"endBinding": {
				"elementId": "fCards",
				"mode": "orbit",
				"fixedPoint": [
					-0.017580074267975226,
					0.3077918656237856
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "zoneAsk",
			"type": "rectangle",
			"x": 2150,
			"y": 860,
			"width": 780,
			"height": 620,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "#e9ecef",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 0,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b00",
			"roundness": {
				"type": 3
			},
			"seed": 3104889,
			"version": 3,
			"versionNonce": 2080415929,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671614154,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "zoneAskT",
			"type": "text",
			"x": 2170,
			"y": 876,
			"width": 251.01980590820312,
			"height": 25,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b01",
			"roundness": null,
			"seed": 1699725207,
			"version": 3,
			"versionNonce": 979477335,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671614154,
			"link": null,
			"locked": false,
			"text": "5 — Answering a question",
			"rawText": "5 — Answering a question",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "5 — Answering a question",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "question",
			"type": "ellipse",
			"x": 2180,
			"y": 900,
			"width": 220,
			"height": 90,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "#ffd8a8",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b02",
			"roundness": null,
			"seed": 675211609,
			"version": 5,
			"versionNonce": 1193092685,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "IgEU1wex"
				},
				{
					"id": "aql0",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "IgEU1wex",
			"type": "text",
			"x": 2248.672035217285,
			"y": 935,
			"width": 82.65592956542969,
			"height": 20,
			"angle": 0,
			"strokeColor": "#e8590c",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b02V",
			"roundness": null,
			"seed": 1338374103,
			"version": 8,
			"versionNonce": 2058275107,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221455,
			"link": null,
			"locked": false,
			"text": "A question",
			"rawText": "A question",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "question",
			"originalText": "A question",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "l0box",
			"type": "rectangle",
			"x": 2450,
			"y": 895,
			"width": 450,
			"height": 100,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "#a5d8ff",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b03",
			"roundness": {
				"type": 3
			},
			"seed": 780252343,
			"version": 7,
			"versionNonce": 1467317763,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "TsFthM8O"
				},
				{
					"id": "aql0",
					"type": "arrow"
				},
				{
					"id": "a01",
					"type": "arrow"
				},
				{
					"id": "aidxask",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "TsFthM8O",
			"type": "text",
			"x": 2542.7521057128906,
			"y": 925,
			"width": 264.49578857421875,
			"height": 40,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b03V",
			"roundness": null,
			"seed": 369550583,
			"version": 5,
			"versionNonce": 357568707,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "L0 — route\ngrep _index.tsv · ~50–180 tokens",
			"rawText": "L0 — route\ngrep _index.tsv · ~50–180 tokens",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "l0box",
			"originalText": "L0 — route\ngrep _index.tsv · ~50–180 tokens",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "l1box",
			"type": "rectangle",
			"x": 2450,
			"y": 1025,
			"width": 450,
			"height": 100,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "#a5d8ff",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b04",
			"roundness": {
				"type": 3
			},
			"seed": 992630329,
			"version": 6,
			"versionNonce": 271914957,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "brb8naMz"
				},
				{
					"id": "a01",
					"type": "arrow"
				},
				{
					"id": "a12",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "brb8naMz",
			"type": "text",
			"x": 2540.6161041259766,
			"y": 1055,
			"width": 268.7677917480469,
			"height": 40,
			"angle": 0,
			"strokeColor": "#1971c2",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b04V",
			"roundness": null,
			"seed": 2079141399,
			"version": 5,
			"versionNonce": 872976621,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "L1 — card\none _cards.tsv row · ~220 tokens",
			"rawText": "L1 — card\none _cards.tsv row · ~220 tokens",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "l1box",
			"originalText": "L1 — card\none _cards.tsv row · ~220 tokens",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "l2box",
			"type": "rectangle",
			"x": 2450,
			"y": 1155,
			"width": 450,
			"height": 100,
			"angle": 0,
			"strokeColor": "#0c8599",
			"backgroundColor": "#99e9f2",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b05",
			"roundness": {
				"type": 3
			},
			"seed": 603456983,
			"version": 6,
			"versionNonce": 1891715213,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "DyUJ0ZJF"
				},
				{
					"id": "a12",
					"type": "arrow"
				},
				{
					"id": "a23",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "DyUJ0ZJF",
			"type": "text",
			"x": 2550.448097229004,
			"y": 1185,
			"width": 249.1038055419922,
			"height": 40,
			"angle": 0,
			"strokeColor": "#0c8599",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b05V",
			"roundness": null,
			"seed": 476926775,
			"version": 5,
			"versionNonce": 1530331235,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "L2 — section\nsed an exact range · ~300–600",
			"rawText": "L2 — section\nsed an exact range · ~300–600",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "l2box",
			"originalText": "L2 — section\nsed an exact range · ~300–600",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "l3box",
			"type": "rectangle",
			"x": 2450,
			"y": 1285,
			"width": 450,
			"height": 80,
			"angle": 0,
			"strokeColor": "#0c8599",
			"backgroundColor": "#99e9f2",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b06",
			"roundness": {
				"type": 3
			},
			"seed": 1003824921,
			"version": 5,
			"versionNonce": 1832850115,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "GPEBoQ0h"
				},
				{
					"id": "a23",
					"type": "arrow"
				}
			],
			"updated": 1789691221447,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "GPEBoQ0h",
			"type": "text",
			"x": 2568.1760864257812,
			"y": 1315,
			"width": 213.6478271484375,
			"height": 20,
			"angle": 0,
			"strokeColor": "#0c8599",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b06V",
			"roundness": null,
			"seed": 1072419927,
			"version": 5,
			"versionNonce": 1476520781,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "L3 — the whole node (rare)",
			"rawText": "L3 — the whole node (rare)",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "l3box",
			"originalText": "L3 — the whole node (rare)",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "askNote1",
			"type": "text",
			"x": 2180,
			"y": 1030,
			"width": 180.83184814453125,
			"height": 100,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b07",
			"roundness": null,
			"seed": 1959211767,
			"version": 3,
			"versionNonce": 1506717367,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671614154,
			"link": null,
			"locked": false,
			"text": "Side paths:\n_links for neighbours,\n_mentions for a person\nover time, Now for\n\"what's my status?\"",
			"rawText": "Side paths:\n_links for neighbours,\n_mentions for a person\nover time, Now for\n\"what's my status?\"",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Side paths:\n_links for neighbours,\n_mentions for a person\nover time, Now for\n\"what's my status?\"",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "askNote2",
			"type": "text",
			"x": 2180,
			"y": 1390,
			"width": 394.57568359375,
			"height": 40,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b08",
			"roundness": null,
			"seed": 78830585,
			"version": 5,
			"versionNonce": 544072449,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789712821323,
			"link": null,
			"locked": false,
			"text": "Stop at the first rung that answers.\nTarget: 30–50× cheaper than loading the sources.",
			"rawText": "Stop at the first rung that answers.\nTarget: 30–50× cheaper than loading the sources.",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Stop at the first rung that answers.\nTarget: 30–50× cheaper than loading the sources.",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "zoneGrd",
			"type": "rectangle",
			"x": 0,
			"y": 860,
			"width": 2100,
			"height": 440,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "#e9ecef",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 0,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b09",
			"roundness": {
				"type": 3
			},
			"seed": 2037627927,
			"version": 3,
			"versionNonce": 261472215,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671614154,
			"link": null,
			"locked": false,
			"hasTextLink": false
		},
		{
			"id": "zoneGrdT",
			"type": "text",
			"x": 20,
			"y": 876,
			"width": 337.29974365234375,
			"height": 25,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0A",
			"roundness": null,
			"seed": 1439102169,
			"version": 3,
			"versionNonce": 763890969,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789671614154,
			"link": null,
			"locked": false,
			"text": "Guards — nothing ships unchecked",
			"rawText": "Guards — nothing ships unchecked",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Guards — nothing ships unchecked",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "selftest",
			"type": "rectangle",
			"x": 40,
			"y": 940,
			"width": 380,
			"height": 110,
			"angle": 0,
			"strokeColor": "#9c36b5",
			"backgroundColor": "#eebefa",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0B",
			"roundness": {
				"type": 3
			},
			"seed": 99754295,
			"version": 5,
			"versionNonce": 848984268,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "q1dPttgq"
				}
			],
			"updated": 1789712821322,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "q1dPttgq",
			"type": "text",
			"x": 138.88008880615234,
			"y": 965,
			"width": 182.2398223876953,
			"height": 60,
			"angle": 0,
			"strokeColor": "#9c36b5",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0BV",
			"roundness": null,
			"seed": 775762295,
			"version": 7,
			"versionNonce": 783556511,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789712821322,
			"link": null,
			"locked": false,
			"text": "node tools/selftest.js\nregression tests — the\ntooling itself is sound",
			"rawText": "node tools/selftest.js\nregression tests — the\ntooling itself is sound",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "selftest",
			"originalText": "node tools/selftest.js\nregression tests — the\ntooling itself is sound",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "probesb",
			"type": "rectangle",
			"x": 460,
			"y": 940,
			"width": 380,
			"height": 110,
			"angle": 0,
			"strokeColor": "#9c36b5",
			"backgroundColor": "#eebefa",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0C",
			"roundness": {
				"type": 3
			},
			"seed": 581235129,
			"version": 7,
			"versionNonce": 2047542019,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "Cn1QE8ze"
				},
				{
					"id": "apa",
					"type": "arrow"
				}
			],
			"updated": 1789829869667,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "Cn1QE8ze",
			"type": "text",
			"x": 539.1280975341797,
			"y": 965,
			"width": 221.74380493164062,
			"height": 60,
			"angle": 0,
			"strokeColor": "#9c36b5",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0CV",
			"roundness": null,
			"seed": 1084615319,
			"version": 7,
			"versionNonce": 1057418198,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789829869668,
			"link": null,
			"locked": false,
			"text": "tools/probes.json\nrouting probes · must-route\nfences, replayed by the build",
			"rawText": "tools/probes.json\nrouting probes · must-route\nfences, replayed by the build",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "probesb",
			"originalText": "tools/probes.json\nrouting probes · must-route\nfences, replayed by the build",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "auditbox",
			"type": "rectangle",
			"x": 880,
			"y": 940,
			"width": 380,
			"height": 110,
			"angle": 0,
			"strokeColor": "#9c36b5",
			"backgroundColor": "#eebefa",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0D",
			"roundness": {
				"type": 3
			},
			"seed": 2074534487,
			"version": 7,
			"versionNonce": 531771773,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "6FIRLFZZ"
				},
				{
					"id": "apa",
					"type": "arrow"
				},
				{
					"id": "aad",
					"type": "arrow"
				}
			],
			"updated": 1789829869666,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "6FIRLFZZ",
			"type": "text",
			"x": 946.6641235351562,
			"y": 965,
			"width": 246.6717529296875,
			"height": 60,
			"angle": 0,
			"strokeColor": "#9c36b5",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0DV",
			"roundness": null,
			"seed": 869957559,
			"version": 6,
			"versionNonce": 612898946,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789829869667,
			"link": null,
			"locked": false,
			"text": "/vault-audit · /vault-deep-audit\nnode tools/audit.js\n11 sections, on request",
			"rawText": "/vault-audit · /vault-deep-audit\nnode tools/audit.js\n11 sections, on request",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "auditbox",
			"originalText": "/vault-audit · /vault-deep-audit\nnode tools/audit.js\n11 sections, on request",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "defects",
			"type": "rectangle",
			"x": 1300,
			"y": 940,
			"width": 380,
			"height": 110,
			"angle": 0,
			"strokeColor": "#e03131",
			"backgroundColor": "#ffc9c9",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0E",
			"roundness": {
				"type": 3
			},
			"seed": 544232089,
			"version": 8,
			"versionNonce": 1165771758,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "vfV3esKW"
				},
				{
					"id": "aad",
					"type": "arrow"
				}
			],
			"updated": 1789829869668,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "vfV3esKW",
			"type": "text",
			"x": 1393.736068725586,
			"y": 965,
			"width": 192.52786254882812,
			"height": 60,
			"angle": 0,
			"strokeColor": "#e03131",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0EV",
			"roundness": null,
			"seed": 973041879,
			"version": 8,
			"versionNonce": 795409275,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789829869668,
			"link": null,
			"locked": false,
			"text": "tools/DEFECTS.md\nD01–D78 inherited, each\nwith a guard in code",
			"rawText": "tools/DEFECTS.md\nD01–D78 inherited, each\nwith a guard in code",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "defects",
			"originalText": "tools/DEFECTS.md\nD01–D78 inherited, each\nwith a guard in code",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "gitbox",
			"type": "rectangle",
			"x": 1720,
			"y": 940,
			"width": 360,
			"height": 110,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "#b2f2bb",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0F",
			"roundness": {
				"type": 3
			},
			"seed": 459702135,
			"version": 3,
			"versionNonce": 770841399,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "HNeWn1Xw"
				}
			],
			"updated": 1789671614154,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "HNeWn1Xw",
			"type": "text",
			"x": 1803.1440887451172,
			"y": 965,
			"width": 193.71182250976562,
			"height": 60,
			"angle": 0,
			"strokeColor": "#2f9e44",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0FV",
			"roundness": null,
			"seed": 1286159863,
			"version": 5,
			"versionNonce": 1033639747,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691195522,
			"link": null,
			"locked": false,
			"text": "git — private repo\none commit a session\nObsidian setup versioned",
			"rawText": "git — private repo\none commit a session\nObsidian setup versioned",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "gitbox",
			"originalText": "git — private repo\none commit a session\nObsidian setup versioned",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "grdNote1",
			"type": "text",
			"x": 40,
			"y": 1110,
			"width": 535.9835815429688,
			"height": 60,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0G",
			"roundness": null,
			"seed": 333223801,
			"version": 5,
			"versionNonce": 1411126488,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789829869669,
			"link": null,
			"locked": false,
			"text": "Nothing is committed until the self-test and the build pass;\nthe audit runs when you type /vault-audit. Every defect is fixed,\nroot-caused, guarded in code, written into CLAUDE.md and ledgered.",
			"rawText": "Nothing is committed until the self-test and the build pass;\nthe audit runs when you type /vault-audit. Every defect is fixed,\nroot-caused, guarded in code, written into CLAUDE.md and ledgered.",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Nothing is committed until the self-test and the build pass;\nthe audit runs when you type /vault-audit. Every defect is fixed,\nroot-caused, guarded in code, written into CLAUDE.md and ledgered.",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "grdNote2",
			"type": "text",
			"x": 40,
			"y": 1200,
			"width": 829.2315063476562,
			"height": 20,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0H",
			"roundness": null,
			"seed": 393574551,
			"version": 5,
			"versionNonce": 934289792,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789712821323,
			"link": null,
			"locked": false,
			"text": "The audit replays the benchmark queries and fails if answering stops being 30× cheaper than the sources.",
			"rawText": "The audit replays the benchmark queries and fails if answering stops being 30× cheaper than the sources.",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "The audit replays the benchmark queries and fails if answering stops being 30× cheaper than the sources.",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "aql0",
			"type": "arrow",
			"x": 2406,
			"y": 945.009,
			"width": 38,
			"height": 0.0009999999999763531,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0S",
			"roundness": null,
			"seed": 186305977,
			"version": 8,
			"versionNonce": 1324157827,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221484,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					38,
					0.0009999999999763531
				]
			],
			"startBinding": {
				"elementId": "question",
				"mode": "orbit",
				"fixedPoint": [
					1.0272727272727273,
					0.5001
				]
			},
			"endBinding": {
				"elementId": "l0box",
				"mode": "orbit",
				"fixedPoint": [
					-0.013333333333333334,
					0.5001
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "a01",
			"type": "arrow",
			"x": 2675.045,
			"y": 1001,
			"width": 0,
			"height": 18,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0T",
			"roundness": null,
			"seed": 1661781591,
			"version": 8,
			"versionNonce": 887530275,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221484,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					0,
					18
				]
			],
			"startBinding": {
				"elementId": "l0box",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					1.06
				]
			},
			"endBinding": {
				"elementId": "l1box",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					-0.06
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "a12",
			"type": "arrow",
			"x": 2675.045,
			"y": 1131,
			"width": 0,
			"height": 18,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0U",
			"roundness": null,
			"seed": 902475417,
			"version": 8,
			"versionNonce": 805074531,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221487,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					0,
					18
				]
			],
			"startBinding": {
				"elementId": "l1box",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					1.06
				]
			},
			"endBinding": {
				"elementId": "l2box",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					-0.06
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "a23",
			"type": "arrow",
			"x": 2675.045,
			"y": 1261,
			"width": 0,
			"height": 18,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0V",
			"roundness": null,
			"seed": 1685054327,
			"version": 8,
			"versionNonce": 1518711299,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221487,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					0,
					18
				]
			],
			"startBinding": {
				"elementId": "l2box",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					1.06
				]
			},
			"endBinding": {
				"elementId": "l3box",
				"mode": "orbit",
				"fixedPoint": [
					0.5001,
					-0.075
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "aidxask",
			"type": "arrow",
			"x": 2683.9890163633168,
			"y": 745.9999999999999,
			"width": 6.459443919368368,
			"height": 143.0000000000001,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0W",
			"roundness": null,
			"seed": 1166766969,
			"version": 8,
			"versionNonce": 1124878019,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221486,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					-6.459443919368368,
					143.0000000000001
				]
			],
			"startBinding": {
				"elementId": "zoneIdx",
				"mode": "orbit",
				"fixedPoint": [
					0.6846326836256058,
					1.0088034322954487
				]
			},
			"endBinding": {
				"elementId": "l0box",
				"mode": "orbit",
				"fixedPoint": [
					0.5056206585871061,
					-0.05993888110984358
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "apa",
			"type": "arrow",
			"x": 846,
			"y": 995.011,
			"width": 28,
			"height": 0,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0X",
			"roundness": null,
			"seed": 1102208151,
			"version": 8,
			"versionNonce": 1134983587,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221488,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					28,
					0
				]
			],
			"startBinding": {
				"elementId": "probesb",
				"mode": "orbit",
				"fixedPoint": [
					1.0157894736842106,
					0.5001
				]
			},
			"endBinding": {
				"elementId": "auditbox",
				"mode": "orbit",
				"fixedPoint": [
					-0.015789473684210527,
					0.5001
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "aad",
			"type": "arrow",
			"x": 1266,
			"y": 995.011,
			"width": 28,
			"height": 0,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0Y",
			"roundness": null,
			"seed": 782277721,
			"version": 8,
			"versionNonce": 1217219907,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221489,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					28,
					0
				]
			],
			"startBinding": {
				"elementId": "auditbox",
				"mode": "orbit",
				"fixedPoint": [
					1.0157894736842106,
					0.5001
				]
			},
			"endBinding": {
				"elementId": "defects",
				"mode": "orbit",
				"fixedPoint": [
					-0.015789473684210527,
					0.5001
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "akbld",
			"type": "arrow",
			"x": 1496,
			"y": 268.79611650485435,
			"width": 127.99999999999977,
			"height": 13.669902912621353,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0Z",
			"roundness": null,
			"seed": 1609041288,
			"version": 8,
			"versionNonce": 1307836483,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221479,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					127.99999999999977,
					13.669902912621353
				]
			],
			"startBinding": {
				"elementId": "kinds",
				"mode": "orbit",
				"fixedPoint": [
					1.017547275593385,
					0.6566041108996165
				]
			},
			"endBinding": {
				"elementId": "builder",
				"mode": "orbit",
				"fixedPoint": [
					-0.014551399272563242,
					0.2951785692216008
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "afigb",
			"type": "arrow",
			"x": 1496,
			"y": 590.01,
			"width": 127.99999999999977,
			"height": 258.1554545454546,
			"angle": 0,
			"strokeColor": "#1e1e1e",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0a",
			"roundness": null,
			"seed": 1990915832,
			"version": 8,
			"versionNonce": 622217571,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221477,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					64,
					-0.009999999999990905
				],
				[
					64,
					-250.01
				],
				[
					127.99999999999977,
					-258.1554545454546
				]
			],
			"startBinding": {
				"elementId": "figures",
				"mode": "orbit",
				"fixedPoint": [
					1.0176470588235293,
					0.5001
				]
			},
			"endBinding": {
				"elementId": "builder",
				"mode": "orbit",
				"fixedPoint": [
					-0.014517042610589491,
					0.7440766797177508
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "nlmbox",
			"type": "rectangle",
			"x": 330,
			"y": 750,
			"width": 760,
			"height": 85,
			"angle": 0,
			"strokeColor": "#f08c00",
			"backgroundColor": "#ffec99",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0b",
			"roundness": {
				"type": 3
			},
			"seed": 471833700,
			"version": 10,
			"versionNonce": 756241814,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "jPi1MvNT"
				},
				{
					"id": "anlmv",
					"type": "arrow"
				},
				{
					"id": "anlmt",
					"type": "arrow"
				}
			],
			"updated": 1789744367583,
			"link": null,
			"locked": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false
		},
		{
			"id": "jPi1MvNT",
			"type": "text",
			"x": 421.3601989746094,
			"y": 767.5,
			"width": 577.2796020507812,
			"height": 50,
			"angle": 0,
			"strokeColor": "#f08c00",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0c",
			"roundness": null,
			"seed": 177467484,
			"version": 5,
			"versionNonce": 1144173219,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691221448,
			"link": null,
			"locked": false,
			"text": "NotebookLM — grounded second reader\ntriage the batch · verify the compile · never a source (D74)",
			"rawText": "NotebookLM — grounded second reader\ntriage the batch · verify the compile · never a source (D74)",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "nlmbox",
			"originalText": "NotebookLM — grounded second reader\ntriage the batch · verify the compile · never a source (D74)",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null,
			"hasTextLink": false
		},
		{
			"id": "anlmv",
			"type": "arrow",
			"x": 1096,
			"y": 790.1463414634147,
			"width": 24,
			"height": 540.1463414634147,
			"angle": 0,
			"strokeColor": "#f08c00",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0e",
			"roundness": null,
			"seed": 492658148,
			"version": 9,
			"versionNonce": 1227595683,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "TY6aILcy"
				}
			],
			"updated": 1789691221465,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					24,
					-0.14634146341472842
				],
				[
					24,
					-540.1463414634147
				],
				[
					0,
					-540.1363414634147
				]
			],
			"startBinding": {
				"elementId": "nlmbox",
				"mode": "orbit",
				"fixedPoint": [
					1.0078945900820537,
					0.47230990757084995
				]
			},
			"endBinding": {
				"elementId": "compile",
				"mode": "orbit",
				"fixedPoint": [
					1.0176470588235293,
					0.5001
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"customData": {
				"legacyTextWrap": true
			},
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "TY6aILcy",
			"type": "text",
			"x": 1092.3500289916992,
			"y": 507.50022203775893,
			"width": 55.29994201660156,
			"height": 25,
			"angle": 0,
			"strokeColor": "#f08c00",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0g",
			"roundness": null,
			"seed": 2072888924,
			"version": 6,
			"versionNonce": 1787527529,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691024349,
			"link": null,
			"locked": false,
			"text": "verify",
			"rawText": "verify",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "anlmv",
			"originalText": "verify",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": 0.5,
			"hasTextLink": false
		},
		{
			"id": "anlmt",
			"type": "arrow",
			"x": 626,
			"y": 375.009,
			"width": 119,
			"height": 369.0000000000001,
			"angle": 0,
			"strokeColor": "#f08c00",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "dashed",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0h",
			"roundness": null,
			"seed": 186654620,
			"version": 8,
			"versionNonce": 444609238,
			"isDeleted": false,
			"boundElements": [
				{
					"type": "text",
					"id": "UaqsPp3l"
				}
			],
			"updated": 1789744367586,
			"link": null,
			"locked": false,
			"points": [
				[
					0,
					0
				],
				[
					54,
					-0.009000000000014552
				],
				[
					54,
					324.991
				],
				[
					119,
					324.991
				],
				[
					102.35135135135135,
					368.9910000000001
				]
			],
			"startBinding": {
				"elementId": "docs",
				"mode": "orbit",
				"fixedPoint": [
					1.0206896551724138,
					0.5001
				]
			},
			"endBinding": {
				"elementId": "nlmbox",
				"mode": "orbit",
				"fixedPoint": [
					0.523953202191548,
					-0.0660202064086795
				]
			},
			"startArrowhead": null,
			"endArrowhead": "arrow",
			"elbowed": false,
			"hasTextLink": false,
			"moveMidPointsWithElement": false
		},
		{
			"id": "UaqsPp3l",
			"type": "text",
			"x": 651.030029296875,
			"y": 553.6567942970546,
			"width": 57.93994140625,
			"height": 25,
			"angle": 0,
			"strokeColor": "#f08c00",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0i",
			"roundness": null,
			"seed": 1997242148,
			"version": 4,
			"versionNonce": 1511183396,
			"isDeleted": false,
			"boundElements": [],
			"updated": 1789691638113,
			"link": null,
			"locked": false,
			"text": "triage",
			"rawText": "triage",
			"fontSize": 20,
			"fontFamily": 5,
			"textAlign": "center",
			"verticalAlign": "middle",
			"containerId": "anlmt",
			"originalText": "triage",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": 0.5,
			"hasTextLink": false
		},
		{
			"id": "skLegend",
			"type": "text",
			"x": 900,
			"y": 1110,
			"width": 435.48760986328125,
			"height": 80,
			"angle": 0,
			"strokeColor": "#868e96",
			"backgroundColor": "transparent",
			"fillStyle": "solid",
			"strokeWidth": 2,
			"strokeStyle": "solid",
			"roughness": 1,
			"opacity": 100,
			"groupIds": [],
			"frameId": null,
			"index": "b0j",
			"roundness": null,
			"seed": 555009453,
			"version": 3,
			"versionNonce": 538741571,
			"isDeleted": false,
			"boundElements": null,
			"updated": 1789829869669,
			"link": null,
			"locked": false,
			"text": "Dashed border — a skill only you start, by typing it:\n/vault-compile, /vault-audit, /vault-deep-audit.\nClaude may start vault-excalidraw on its own. Captures,\nthe build and the self-test are never gated.",
			"rawText": "Dashed border — a skill only you start, by typing it:\n/vault-compile, /vault-audit, /vault-deep-audit.\nClaude may start vault-excalidraw on its own. Captures,\nthe build and the self-test are never gated.",
			"fontSize": 16,
			"fontFamily": 5,
			"textAlign": "left",
			"verticalAlign": "top",
			"containerId": null,
			"originalText": "Dashed border — a skill only you start, by typing it:\n/vault-compile, /vault-audit, /vault-deep-audit.\nClaude may start vault-excalidraw on its own. Captures,\nthe build and the self-test are never gated.",
			"autoResize": true,
			"lineHeight": 1.25,
			"labelPosition": null
		}
	],
	"appState": {
		"theme": "light",
		"viewBackgroundColor": "#ffffff",
		"currentItemStrokeColor": "#1e1e1e",
		"currentItemBackgroundColor": "transparent",
		"currentItemFillStyle": "solid",
		"currentItemStrokeWidthKey": "medium",
		"currentItemStrokeVariability": "constant",
		"currentItemStrokeStyle": "solid",
		"currentItemRoughness": 1,
		"currentItemOpacity": 100,
		"currentItemFontFamily": 5,
		"currentItemFontSize": 20,
		"currentItemTextAlign": "left",
		"currentItemStartArrowhead": null,
		"currentItemEndArrowhead": "arrow",
		"currentItemArrowType": "round",
		"currentItemFrameRole": null,
		"scrollX": -645.3932963699787,
		"scrollY": -71.37859036510022,
		"zoom": {
			"value": 0.823447
		},
		"currentItemRoundness": "round",
		"gridSize": 20,
		"gridStep": 5,
		"gridModeEnabled": false,
		"gridColor": {
			"Bold": "rgba(179, 179, 179, 0.5)",
			"Regular": "rgba(204, 204, 204, 0.5)"
		},
		"colorTopPicks": {
			"elementStroke": null,
			"elementBackground": null,
			"bucketFill": null
		},
		"currentStrokeOptions": null,
		"frameRendering": {
			"enabled": true,
			"clip": true,
			"name": true,
			"outline": true,
			"markerName": true,
			"markerEnabled": true
		},
		"objectsSnapModeEnabled": false,
		"activeTool": {
			"type": "hand",
			"customType": null,
			"locked": false,
			"fromSelection": false,
			"lastActiveTool": null
		},
		"disableContextMenu": false,
		"bindingPreference": "enabled",
		"isMidpointSnappingEnabled": true,
		"boxSelectionMode": "contain"
	},
	"files": {}
}
```
%%