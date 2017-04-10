// Angular
// import "@angular/platform-browser";
// import "@angular/platform-browser-dynamic";
// import "@angular/core";
// import "@angular/common";
// import "@angular/http";
// import "@angular/router";

// RxJS
// import "rxjs";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";

import "rxjs/add/observable/from";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/observable/forkJoin";

// Material Angular
import "./styles/matherial-theme.scss";

// Deactivate md-select animation to agree missing animations of md-autocomplete

import { transformPanel, fadeInContent } from "@angular/material";
import { AnimationTransitionMetadata } from "@angular/animations";
( fadeInContent.definitions[ 1 ] as AnimationTransitionMetadata ).animation[ 1 ].timings = 0;
( transformPanel.definitions[ 1 ] as AnimationTransitionMetadata ).animation[ 1 ].timings = 0;
( transformPanel.definitions[ 2 ] as AnimationTransitionMetadata ).animation[ 0 ].timings = 0;

// JQuery
// import "jquery";

// Semantic UI
// import "../src/semantic/dist/semantic.js";
// import "../src/semantic/dist/semantic.css";