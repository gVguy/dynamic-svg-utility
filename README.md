# Dynamic SVG Utility

Rewrite your SVG's dimensions, paths and coordinates for responsive implementations

<p align="center">🚀&nbsp;&nbsp;<b><a href="https://gvguy.github.io/dynamic-svg-utility/">Open Utility</a></b>&nbsp;&nbsp;🚀</p>

## What it does

- rewrites all SVG's `width`, `height` and `viewBox` attributes to match **target size**
- rewrites all SVG's `d`, `x`, & `y` attributes to position them in relation to new size
- if a *numeric* target size is provided, transforms the SVG statically
- if a *string* target size is provided, treats it as a variable name, and outputs Vue.js compatible code of an SVG generated dynamically based on varible value

## How to use

- paste your initial SVG code into the upper textarea
- your SVG should appear on the right
- use mouse to set slice position
- enter the desired target width &/or height into the inputs next to the process button
- click process
- the output code should appear inside the lower textarea

## Example (static)

Simple example of i/o with following parameters:
- **target width** = `200`
- **slice** = `50`

### Input
```xml
<svg width="100" height="100" viewBox="0 0 100 100">
  <rect x="5" y="5" width="90" height="90" />
  <path d="M 10 10 V 90 H 90 Z" fill="pink" />
  <path d="M 10 10 H 90 V 90 Z" fill="gold" />
</svg>
```

### Output
```xml
<svg width="200" height="100" viewBox="0 0 200 100">
  <rect x="5" y="5" width="190" height="90" />
  <path d="M 10 10 V 90 H 190 Z" fill="pink" />
  <path d="M 10 10 H 190 V 90 Z" fill="gold" />
</svg>
```

## Example (dynamic)

Now lets run it again with the same input, but this time use a variable name instead of a static value:
- **target width** = `myDynamicWidth`
- **slice** = `50`

### Output
```xml
<svg :width="myDynamicWidth" height="100" :viewBox="`0 0 ${myDynamicWidth} 100`">
  <rect x="5" y="5" :width="myDynamicWidth - 10" height="90" />
  <path :d="`M 10 10 V 90 H ${myDynamicWidth - 10} Z`" fill="pink" />
  <path :d="`M 10 10 H ${myDynamicWidth - 10} V 90 Z`" fill="gold" />
</svg>
```

As you can see, here the utility changes all SVG values to be dynamically calculated based on the provided variable name

Output code is also made Vue.js compatible width `:` v-bind shortcuts, enabling direct copy-pasting into a Vue.js component template
