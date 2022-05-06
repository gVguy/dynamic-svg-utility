(()=>{var e={144:(e,t,n)=>{"use strict";n.d(t,{Z:()=>c});var r=n(81),i=n.n(r),o=n(645),a=n.n(o)()(i());a.push([e.id,"body{margin:0}#main{display:flex;width:100%;height:100vh;background:#060606}#main #textarea-container{width:50%;display:flex;flex-direction:column;justify-content:center;align-items:stretch}#main #textarea-container textarea{height:50%;background:#1d1e22;color:#fff}#main #image-container{width:50%;display:flex;justify-content:center;align-items:center;flex-direction:column;color:transparent;position:relative}#main #image-container #svg-wrapper,#main #image-container #output-svg-wrapper{border:1px #3f3f3f solid}#main #image-container #output-svg-wrapper{color:#636363}#main #image-container #vertical-selector{position:absolute;width:1px;background:red;opacity:0;pointer-events:none}#main #image-container #controls,#main #image-container #stats{position:absolute;top:0;background:#010101;padding:10px;display:flex;justify-content:center}#main #image-container #controls *,#main #image-container #stats *{margin:5px}#main #image-container #stats{top:initial;bottom:0;color:#fff}",""]);const c=a},645:e=>{"use strict";e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n="",r=void 0!==t[5];return t[4]&&(n+="@supports (".concat(t[4],") {")),t[2]&&(n+="@media ".concat(t[2]," {")),r&&(n+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),n+=e(t),r&&(n+="}"),t[2]&&(n+="}"),t[4]&&(n+="}"),n})).join("")},t.i=function(e,n,r,i,o){"string"==typeof e&&(e=[[null,e,void 0]]);var a={};if(r)for(var c=0;c<this.length;c++){var s=this[c][0];null!=s&&(a[s]=!0)}for(var u=0;u<e.length;u++){var l=[].concat(e[u]);r&&a[l[0]]||(void 0!==o&&(void 0===l[5]||(l[1]="@layer".concat(l[5].length>0?" ".concat(l[5]):""," {").concat(l[1],"}")),l[5]=o),n&&(l[2]?(l[1]="@media ".concat(l[2]," {").concat(l[1],"}"),l[2]=n):l[2]=n),i&&(l[4]?(l[1]="@supports (".concat(l[4],") {").concat(l[1],"}"),l[4]=i):l[4]="".concat(i)),t.push(l))}},t}},81:e=>{"use strict";e.exports=function(e){return e[1]}},379:e=>{"use strict";var t=[];function n(e){for(var n=-1,r=0;r<t.length;r++)if(t[r].identifier===e){n=r;break}return n}function r(e,r){for(var o={},a=[],c=0;c<e.length;c++){var s=e[c],u=r.base?s[0]+r.base:s[0],l=o[u]||0,d="".concat(u," ").concat(l);o[u]=l+1;var p=n(d),v={css:s[1],media:s[2],sourceMap:s[3],supports:s[4],layer:s[5]};if(-1!==p)t[p].references++,t[p].updater(v);else{var f=i(v,r);r.byIndex=c,t.splice(c,0,{identifier:d,updater:f,references:1})}a.push(d)}return a}function i(e,t){var n=t.domAPI(t);return n.update(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap&&t.supports===e.supports&&t.layer===e.layer)return;n.update(e=t)}else n.remove()}}e.exports=function(e,i){var o=r(e=e||[],i=i||{});return function(e){e=e||[];for(var a=0;a<o.length;a++){var c=n(o[a]);t[c].references--}for(var s=r(e,i),u=0;u<o.length;u++){var l=n(o[u]);0===t[l].references&&(t[l].updater(),t.splice(l,1))}o=s}}},569:e=>{"use strict";var t={};e.exports=function(e,n){var r=function(e){if(void 0===t[e]){var n=document.querySelector(e);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}t[e]=n}return t[e]}(e);if(!r)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");r.appendChild(n)}},216:e=>{"use strict";e.exports=function(e){var t=document.createElement("style");return e.setAttributes(t,e.attributes),e.insert(t,e.options),t}},565:(e,t,n)=>{"use strict";e.exports=function(e){var t=n.nc;t&&e.setAttribute("nonce",t)}},795:e=>{"use strict";e.exports=function(e){var t=e.insertStyleElement(e);return{update:function(n){!function(e,t,n){var r="";n.supports&&(r+="@supports (".concat(n.supports,") {")),n.media&&(r+="@media ".concat(n.media," {"));var i=void 0!==n.layer;i&&(r+="@layer".concat(n.layer.length>0?" ".concat(n.layer):""," {")),r+=n.css,i&&(r+="}"),n.media&&(r+="}"),n.supports&&(r+="}");var o=n.sourceMap;o&&"undefined"!=typeof btoa&&(r+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(o))))," */")),t.styleTagTransform(r,e,t.options)}(t,e,n)},remove:function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(t)}}}},589:e=>{"use strict";e.exports=function(e,t){if(t.styleSheet)t.styleSheet.cssText=e;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(e))}}},519:()=>{var e=document.querySelector("#input"),t=document.querySelector("#output"),n=document.querySelector("#svg-wrapper"),r=document.querySelector("#output-svg-wrapper"),i=document.querySelector("#vertical-selector"),o=document.querySelector("#main"),a=document.querySelector("#target-width"),c=document.querySelector("#reset-button"),s=document.querySelector("#process-button"),u=document.querySelector("#theme-button"),l=null,d=null,p=null,v=null,f=null,m=null,h="#060606",g=document.querySelector("#stats-width"),y=document.querySelector("#stats-height"),x=document.querySelector("#stats-slice");function b(e,t){void 0===e&&(e=""),void 0===t&&(t=""),n.style.width=e?e+"px":"",n.style.height=t?t+"px":"",g.innerHTML=e+"",y.innerHTML=t+""}function w(e,t){var r,o=null!==(r=null==t?void 0:t.offsetX)&&void 0!==r?r:v;i.style.opacity=e?"1":"0",i.style.height=n.clientHeight+"px",i.style.top=n.offsetTop+"px",i.style.left=n.offsetLeft+o+"px"}function L(){v=null,w(!1),x.innerHTML="",E()}function T(e,t){return void 0===t&&(t=!m),t?e:""}function M(e){var t=parseFloat(e);if(t>v){var n=Number((d-t).toFixed(2));return m?Number(m-n):f+(n?" - "+n:"")}return Number(t.toFixed(2))}function E(e){void 0===e&&(e=""),t.innerHTML=e,e.includes("<svg")&&m?(r.innerHTML=e,r.style.width=f+"px",r.style.height=p+"px"):(r.innerHTML=e?"dynamic preview not available":"",r.style.width="",r.style.height="")}e.addEventListener("input",(function(){var t,r,i,o;if(L(),E(),n.innerHTML=e.value,l=n.querySelector("svg")){if(d=Number(null===(t=n.innerHTML.match(/(<svg[^>]+width=")(\d+)/))||void 0===t?void 0:t[2])||Number(null===(r=n.innerHTML.match(/(<svg[^>]+viewBox="\d+\s\d+\s)(\d+)/))||void 0===r?void 0:r[2]),p=Number(null===(i=n.innerHTML.match(/(<svg[^>]+height=")(\d+)/))||void 0===i?void 0:i[2])||Number(null===(o=n.innerHTML.match(/(<svg[^>]+viewBox="\d+\s\d+\s\d+\s)(\d+)/))||void 0===o?void 0:o[2]),b(d,p),!d||!p)return n.innerHTML="",void E("invalid svg");var a=/\sid="([^"]+)"/g,c=e.value,s=c.match(a);null==s||s.forEach((function(e){var t=(Math.random()+1).toString(36).substring(7);a=new RegExp(a,"");var n=e.match(a)[1];c=(c=c.replace(e,' id="'+t+'"')).replace(new RegExp("#"+n,"g"),"#"+t)})),n.innerHTML=c}else n.innerHTML="",b(),E("invalid svg")})),n.addEventListener("mousemove",(function(e){l&&!v&&w(!0,e)})),n.addEventListener("mouseleave",(function(){v||w(!1)})),n.addEventListener("click",(function(e){l&&(v=e.offsetX,x.innerHTML=v+"")})),s.addEventListener("click",(function(){if(f=a.value,m=Number(f),l&&v){var t=e.value,n=/\sd="[^"]+"/gm,r=t.match(n);null==r||r.forEach((function(e){var n=function(e){var t=e.replace(/\sd="([^"]+)"/,"$1"),n="",r=/([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]+)?/gm,i=t.match(r);r=new RegExp(r,""),i.forEach((function(e){var t,i=e.match(r),o=i[1],a=null===(t=i[2])||void 0===t?void 0:t.trim(),c=(null==a?void 0:a.split(/[\s,]/))||[],s=[];if(/[mlhVvcsqtaZz]/.test(o))s=c;else for(var u=0;c.length;){u++;var l=c.shift();if(u%2==1){var d=M(l);l="string"==typeof d?"${"+d+"}":d+""}s.push(l)}n+=o+" "+s.join(" ")+" "}));var o=(n=n.trimEnd()).includes("${");return n=" "+T(":",o)+'d="'+(T("`",o)+n+T("`",o))+'"'}(e);t=t.replace(e,n)})),n=/\swidth="([\d.]+)"/gm;var i=t.match(n);null==i||i.forEach((function(e){n=new RegExp(n,"");var r=M(e.match(n)[1]),i=" "+T(":","string"==typeof r)+'width="'+r+'"';t=t.replace(e,i)})),n=/\sx(\d)?="([\d.]+)"/gm;var o=t.match(n);null==o||o.forEach((function(e){var r;n=new RegExp(n,"");var i=e.match(n),o=null!==(r=i[1])&&void 0!==r?r:"",a=M(i[2]),c=" "+T(":","string"==typeof a)+"x"+o+'="'+a+'"';t=t.replace(e,c)})),E(t=t.replace(/(viewBox="[\d.]+\s[\d.]+\s)[\d.]+(\s[\d.]+")/,T(":")+"$1"+(T("${")+f+T("}"))+"$2")),w(!0)}})),c.addEventListener("click",L),u.addEventListener("click",(function(){h="#060606"==h?"#fbfbfb":"#060606",o.style.background=h}))}},t={};function n(r){var i=t[r];if(void 0!==i)return i.exports;var o=t[r]={id:r,exports:{}};return e[r](o,o.exports,n),o.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=n(379),t=n.n(e),r=n(795),i=n.n(r),o=n(569),a=n.n(o),c=n(565),s=n.n(c),u=n(216),l=n.n(u),d=n(589),p=n.n(d),v=n(144),f={};f.styleTagTransform=p(),f.setAttributes=s(),f.insert=a().bind(null,"head"),f.domAPI=i(),f.insertStyleElement=l(),t()(v.Z,f),v.Z&&v.Z.locals&&v.Z.locals,n(519),console.log("app initialized")})()})();