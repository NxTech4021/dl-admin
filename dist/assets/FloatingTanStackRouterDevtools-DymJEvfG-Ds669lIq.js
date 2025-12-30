import{bd as le,be as Be,bf as _,bg as bt,bh as _t,bi as Ft,bj as zt,bk as W,bl as G,bm as it,bn as Ve,bo as u,bp as Mt,bq as d,br as M,bs as X,bt as et,bu as je,bv as V,bw as s,bx as Ut,by as Bt,bz as ht,bA as Dt,bB as Ot,bC as Tt,bD as yt,bE as nt,bF as Et,bG as It,bH as Gt}from"./index-DbmPa2XL.js";let At={data:""},Pt=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||At},Rt=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,Lt=/\/\*[^]*?\*\/|  +/g,pt=/\n+/g,_e=(e,t)=>{let n="",i="",h="";for(let l in e){let a=e[l];l[0]=="@"?l[1]=="i"?n=l+" "+a+";":i+=l[1]=="f"?_e(a,l):l+"{"+_e(a,l[1]=="k"?"":t)+"}":typeof a=="object"?i+=_e(a,t?t.replace(/([^,])+/g,f=>l.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,g=>/&/.test(g)?g.replace(/&/g,f):f?f+" "+g:g)):l):a!=null&&(l=/^--/.test(l)?l:l.replace(/[A-Z]/g,"-$&").toLowerCase(),h+=_e.p?_e.p(l,a):l+":"+a+";")}return n+(t&&h?t+"{"+h+"}":h)+i},be={},kt=e=>{if(typeof e=="object"){let t="";for(let n in e)t+=n+kt(e[n]);return t}return e},Ht=(e,t,n,i,h)=>{let l=kt(e),a=be[l]||(be[l]=(g=>{let o=0,r=11;for(;o<g.length;)r=101*r+g.charCodeAt(o++)>>>0;return"go"+r})(l));if(!be[a]){let g=l!==e?e:(o=>{let r,v,p=[{}];for(;r=Rt.exec(o.replace(Lt,""));)r[4]?p.shift():r[3]?(v=r[3].replace(pt," ").trim(),p.unshift(p[0][v]=p[0][v]||{})):p[0][r[1]]=r[2].replace(pt," ").trim();return p[0]})(e);be[a]=_e(h?{["@keyframes "+a]:g}:g,n?"":"."+a)}let f=n&&be.g?be.g:null;return n&&(be.g=be[a]),((g,o,r,v)=>{v?o.data=o.data.replace(v,g):o.data.indexOf(g)===-1&&(o.data=r?g+o.data:o.data+g)})(be[a],t,i,f),a},jt=(e,t,n)=>e.reduce((i,h,l)=>{let a=t[l];if(a&&a.call){let f=a(n),g=f&&f.props&&f.props.className||/^go/.test(f)&&f;a=g?"."+g:f&&typeof f=="object"?f.props?"":_e(f,""):f===!1?"":f}return i+h+(a??"")},"");function De(e){let t=this||{},n=e.call?e(t.p):e;return Ht(n.unshift?n.raw?jt(n,[].slice.call(arguments,1),t.p):n.reduce((i,h)=>Object.assign(i,h&&h.call?h(t.p):h),{}):n,Pt(t.target),t.g,t.o,t.k)}De.bind({g:1});De.bind({k:1});const Nt=typeof window>"u";function rt(e){const t={pending:"yellow",success:"green",error:"red",notFound:"purple",redirected:"gray"};return e.isFetching&&e.status==="success"?e.isFetching==="beforeLoad"?"purple":"blue":t[e.status]}function Vt(e,t){const n=e.find(i=>i.routeId===t.id);return n?rt(n):"gray"}function Jt(){const[e,t]=le(!1);return(Nt?Be:_)(()=>{t(!0)}),e}const Yt=e=>{const t=Object.getOwnPropertyNames(Object(e)),n=typeof e=="bigint"?`${e.toString()}n`:e;try{return JSON.stringify(n,t)}catch{return"unable to stringify"}};function qt(e,t=[n=>n]){return e.map((n,i)=>[n,i]).sort(([n,i],[h,l])=>{for(const a of t){const f=a(n),g=a(h);if(typeof f>"u"){if(typeof g>"u")continue;return 1}if(f!==g)return f>g?1:-1}return i-l}).map(([n])=>n)}const P={colors:{inherit:"inherit",current:"currentColor",transparent:"transparent",black:"#000000",white:"#ffffff",neutral:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},darkGray:{50:"#525c7a",100:"#49536e",200:"#414962",300:"#394056",400:"#313749",500:"#292e3d",600:"#212530",700:"#191c24",800:"#111318",900:"#0b0d10"},gray:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},blue:{25:"#F5FAFF",50:"#EFF8FF",100:"#D1E9FF",200:"#B2DDFF",300:"#84CAFF",400:"#53B1FD",500:"#2E90FA",600:"#1570EF",700:"#175CD3",800:"#1849A9",900:"#194185"},green:{25:"#F6FEF9",50:"#ECFDF3",100:"#D1FADF",200:"#A6F4C5",300:"#6CE9A6",400:"#32D583",500:"#12B76A",600:"#039855",700:"#027A48",800:"#05603A",900:"#054F31"},red:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"},yellow:{25:"#FFFCF5",50:"#FFFAEB",100:"#FEF0C7",200:"#FEDF89",300:"#FEC84B",400:"#FDB022",500:"#F79009",600:"#DC6803",700:"#B54708",800:"#93370D",900:"#7A2E0E"},purple:{25:"#FAFAFF",50:"#F4F3FF",100:"#EBE9FE",200:"#D9D6FE",300:"#BDB4FE",400:"#9B8AFB",500:"#7A5AF8",600:"#6938EF",700:"#5925DC",800:"#4A1FB8",900:"#3E1C96"},teal:{25:"#F6FEFC",50:"#F0FDF9",100:"#CCFBEF",200:"#99F6E0",300:"#5FE9D0",400:"#2ED3B7",500:"#15B79E",600:"#0E9384",700:"#107569",800:"#125D56",900:"#134E48"},pink:{25:"#fdf2f8",50:"#fce7f3",100:"#fbcfe8",200:"#f9a8d4",300:"#f472b6",400:"#ec4899",500:"#db2777",600:"#be185d",700:"#9d174d",800:"#831843",900:"#500724"},cyan:{25:"#ecfeff",50:"#cffafe",100:"#a5f3fc",200:"#67e8f9",300:"#22d3ee",400:"#06b6d4",500:"#0891b2",600:"#0e7490",700:"#155e75",800:"#164e63",900:"#083344"}},alpha:{90:"e5",70:"b3",20:"33"},font:{size:{"2xs":"calc(var(--tsrd-font-size) * 0.625)",xs:"calc(var(--tsrd-font-size) * 0.75)",sm:"calc(var(--tsrd-font-size) * 0.875)",md:"var(--tsrd-font-size)"},lineHeight:{xs:"calc(var(--tsrd-font-size) * 1)",sm:"calc(var(--tsrd-font-size) * 1.25)"},weight:{normal:"400",medium:"500",semibold:"600",bold:"700"},fontFamily:{sans:"ui-sans-serif, Inter, system-ui, sans-serif, sans-serif",mono:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"}},border:{radius:{xs:"calc(var(--tsrd-font-size) * 0.125)",sm:"calc(var(--tsrd-font-size) * 0.25)",md:"calc(var(--tsrd-font-size) * 0.375)",full:"9999px"}},size:{0:"0px",.5:"calc(var(--tsrd-font-size) * 0.125)",1:"calc(var(--tsrd-font-size) * 0.25)",1.5:"calc(var(--tsrd-font-size) * 0.375)",2:"calc(var(--tsrd-font-size) * 0.5)",2.5:"calc(var(--tsrd-font-size) * 0.625)",3:"calc(var(--tsrd-font-size) * 0.75)",3.5:"calc(var(--tsrd-font-size) * 0.875)",4:"calc(var(--tsrd-font-size) * 1)",5:"calc(var(--tsrd-font-size) * 1.25)",8:"calc(var(--tsrd-font-size) * 2)"}},Kt=e=>{const{colors:t,font:n,size:i,alpha:h,border:l}=P,{fontFamily:a,lineHeight:f,size:g}=n,o=e?De.bind({target:e}):De;return{devtoolsPanelContainer:o`
      direction: ltr;
      position: fixed;
      bottom: 0;
      right: 0;
      z-index: 99999;
      width: 100%;
      max-height: 90%;
      border-top: 1px solid ${t.gray[700]};
      transform-origin: top;
    `,devtoolsPanelContainerVisibility:r=>o`
        visibility: ${r?"visible":"hidden"};
      `,devtoolsPanelContainerResizing:r=>r()?o`
          transition: none;
        `:o`
        transition: all 0.4s ease;
      `,devtoolsPanelContainerAnimation:(r,v)=>r?o`
          pointer-events: auto;
          transform: translateY(0);
        `:o`
        pointer-events: none;
        transform: translateY(${v}px);
      `,logo:o`
      cursor: pointer;
      display: flex;
      flex-direction: column;
      background-color: transparent;
      border: none;
      font-family: ${a.sans};
      gap: ${P.size[.5]};
      padding: 0px;
      &:hover {
        opacity: 0.7;
      }
      &:focus-visible {
        outline-offset: 4px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${t.blue[800]};
      }
    `,tanstackLogo:o`
      font-size: ${n.size.md};
      font-weight: ${n.weight.bold};
      line-height: ${n.lineHeight.xs};
      white-space: nowrap;
      color: ${t.gray[300]};
    `,routerLogo:o`
      font-weight: ${n.weight.semibold};
      font-size: ${n.size.xs};
      background: linear-gradient(to right, #84cc16, #10b981);
      background-clip: text;
      -webkit-background-clip: text;
      line-height: 1;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    `,devtoolsPanel:o`
      display: flex;
      font-size: ${g.sm};
      font-family: ${a.sans};
      background-color: ${t.darkGray[700]};
      color: ${t.gray[300]};

      @media (max-width: 700px) {
        flex-direction: column;
      }
      @media (max-width: 600px) {
        font-size: ${g.xs};
      }
    `,dragHandle:o`
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 4px;
      cursor: row-resize;
      z-index: 100000;
      &:hover {
        background-color: ${t.purple[400]}${h[90]};
      }
    `,firstContainer:o`
      flex: 1 1 500px;
      min-height: 40%;
      max-height: 100%;
      overflow: auto;
      border-right: 1px solid ${t.gray[700]};
      display: flex;
      flex-direction: column;
    `,routerExplorerContainer:o`
      overflow-y: auto;
      flex: 1;
    `,routerExplorer:o`
      padding: ${P.size[2]};
    `,row:o`
      display: flex;
      align-items: center;
      padding: ${P.size[2]} ${P.size[2.5]};
      gap: ${P.size[2.5]};
      border-bottom: ${t.darkGray[500]} 1px solid;
      align-items: center;
    `,detailsHeader:o`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: ${t.darkGray[600]};
      padding: 0px ${P.size[2]};
      font-weight: ${n.weight.medium};
      font-size: ${n.size.xs};
      min-height: ${P.size[8]};
      line-height: ${n.lineHeight.xs};
      text-align: left;
      display: flex;
      align-items: center;
    `,maskedBadge:o`
      background: ${t.yellow[900]}${h[70]};
      color: ${t.yellow[300]};
      display: inline-block;
      padding: ${P.size[0]} ${P.size[2.5]};
      border-radius: ${l.radius.full};
      font-size: ${n.size.xs};
      font-weight: ${n.weight.normal};
      border: 1px solid ${t.yellow[300]};
    `,maskedLocation:o`
      color: ${t.yellow[300]};
    `,detailsContent:o`
      padding: ${P.size[1.5]} ${P.size[2]};
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: ${n.size.xs};
    `,routeMatchesToggle:o`
      display: flex;
      align-items: center;
      border: 1px solid ${t.gray[500]};
      border-radius: ${l.radius.sm};
      overflow: hidden;
    `,routeMatchesToggleBtn:(r,v)=>{const k=[o`
        appearance: none;
        border: none;
        font-size: 12px;
        padding: 4px 8px;
        background: transparent;
        cursor: pointer;
        font-family: ${a.sans};
        font-weight: ${n.weight.medium};
      `];if(r){const $=o`
          background: ${t.darkGray[400]};
          color: ${t.gray[300]};
        `;k.push($)}else{const $=o`
          color: ${t.gray[500]};
          background: ${t.darkGray[800]}${h[20]};
        `;k.push($)}return v&&k.push(o`
          border-right: 1px solid ${P.colors.gray[500]};
        `),k},detailsHeaderInfo:o`
      flex: 1;
      justify-content: flex-end;
      display: flex;
      align-items: center;
      font-weight: ${n.weight.normal};
      color: ${t.gray[400]};
    `,matchRow:r=>{const p=[o`
        display: flex;
        border-bottom: 1px solid ${t.darkGray[400]};
        cursor: pointer;
        align-items: center;
        padding: ${i[1]} ${i[2]};
        gap: ${i[2]};
        font-size: ${g.xs};
        color: ${t.gray[300]};
      `];if(r){const k=o`
          background: ${t.darkGray[500]};
        `;p.push(k)}return p},matchIndicator:r=>{const p=[o`
        flex: 0 0 auto;
        width: ${i[3]};
        height: ${i[3]};
        background: ${t[r][900]};
        border: 1px solid ${t[r][500]};
        border-radius: ${l.radius.full};
        transition: all 0.25s ease-out;
        box-sizing: border-box;
      `];if(r==="gray"){const k=o`
          background: ${t.gray[700]};
          border-color: ${t.gray[400]};
        `;p.push(k)}return p},matchID:o`
      flex: 1;
      line-height: ${f.xs};
    `,ageTicker:r=>{const p=[o`
        display: flex;
        gap: ${i[1]};
        font-size: ${g.xs};
        color: ${t.gray[400]};
        font-variant-numeric: tabular-nums;
        line-height: ${f.xs};
      `];if(r){const k=o`
          color: ${t.yellow[400]};
        `;p.push(k)}return p},secondContainer:o`
      flex: 1 1 500px;
      min-height: 40%;
      max-height: 100%;
      overflow: auto;
      border-right: 1px solid ${t.gray[700]};
      display: flex;
      flex-direction: column;
    `,thirdContainer:o`
      flex: 1 1 500px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      border-right: 1px solid ${t.gray[700]};

      @media (max-width: 700px) {
        border-top: 2px solid ${t.gray[700]};
      }
    `,fourthContainer:o`
      flex: 1 1 500px;
      min-height: 40%;
      max-height: 100%;
      overflow: auto;
      display: flex;
      flex-direction: column;
    `,routesContainer:o`
      overflow-x: auto;
      overflow-y: visible;
    `,routesRowContainer:(r,v)=>{const k=[o`
        display: flex;
        border-bottom: 1px solid ${t.darkGray[400]};
        align-items: center;
        padding: ${i[1]} ${i[2]};
        gap: ${i[2]};
        font-size: ${g.xs};
        color: ${t.gray[300]};
        cursor: ${v?"pointer":"default"};
        line-height: ${f.xs};
      `];if(r){const $=o`
          background: ${t.darkGray[500]};
        `;k.push($)}return k},routesRow:r=>{const p=[o`
        flex: 1 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: ${g.xs};
        line-height: ${f.xs};
      `];if(!r){const k=o`
          color: ${t.gray[400]};
        `;p.push(k)}return p},routesRowInner:o`
      display: 'flex';
      align-items: 'center';
      flex-grow: 1;
      min-width: 0;
    `,routeParamInfo:o`
      color: ${t.gray[400]};
      font-size: ${g.xs};
      line-height: ${f.xs};
    `,nestedRouteRow:r=>o`
        margin-left: ${r?0:i[3.5]};
        border-left: ${r?"":`solid 1px ${t.gray[700]}`};
      `,code:o`
      font-size: ${g.xs};
      line-height: ${f.xs};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `,matchesContainer:o`
      flex: 1 1 auto;
      overflow-y: auto;
    `,cachedMatchesContainer:o`
      flex: 1 1 auto;
      overflow-y: auto;
      max-height: 50%;
    `,historyContainer:o`
      display: flex;
      flex: 1 1 auto;
      overflow-y: auto;
      max-height: 50%;
    `,historyOverflowContainer:o`
      padding: ${i[1]} ${i[2]};
      font-size: ${P.font.size.xs};
    `,maskedBadgeContainer:o`
      flex: 1;
      justify-content: flex-end;
      display: flex;
    `,matchDetails:o`
      display: flex;
      flex-direction: column;
      padding: ${P.size[2]};
      font-size: ${P.font.size.xs};
      color: ${P.colors.gray[300]};
      line-height: ${P.font.lineHeight.sm};
    `,matchStatus:(r,v)=>{const k=v&&r==="success"?v==="beforeLoad"?"purple":"blue":{pending:"yellow",success:"green",error:"red",notFound:"purple",redirected:"gray"}[r];return o`
        display: flex;
        justify-content: center;
        align-items: center;
        height: 40px;
        border-radius: ${P.border.radius.sm};
        font-weight: ${P.font.weight.normal};
        background-color: ${P.colors[k][900]}${P.alpha[90]};
        color: ${P.colors[k][300]};
        border: 1px solid ${P.colors[k][600]};
        margin-bottom: ${P.size[2]};
        transition: all 0.25s ease-out;
      `},matchDetailsInfo:o`
      display: flex;
      justify-content: flex-end;
      flex: 1;
    `,matchDetailsInfoLabel:o`
      display: flex;
    `,mainCloseBtn:o`
      background: ${t.darkGray[700]};
      padding: ${i[1]} ${i[2]} ${i[1]} ${i[1.5]};
      border-radius: ${l.radius.md};
      position: fixed;
      z-index: 99999;
      display: inline-flex;
      width: fit-content;
      cursor: pointer;
      appearance: none;
      border: 0;
      gap: 8px;
      align-items: center;
      border: 1px solid ${t.gray[500]};
      font-size: ${n.size.xs};
      cursor: pointer;
      transition: all 0.25s ease-out;

      &:hover {
        background: ${t.darkGray[500]};
      }
    `,mainCloseBtnPosition:r=>o`
        ${r==="top-left"?`top: ${i[2]}; left: ${i[2]};`:""}
        ${r==="top-right"?`top: ${i[2]}; right: ${i[2]};`:""}
        ${r==="bottom-left"?`bottom: ${i[2]}; left: ${i[2]};`:""}
        ${r==="bottom-right"?`bottom: ${i[2]}; right: ${i[2]};`:""}
      `,mainCloseBtnAnimation:r=>r?o`
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
      `:o`
          opacity: 1;
          pointer-events: auto;
          visibility: visible;
        `,routerLogoCloseButton:o`
      font-weight: ${n.weight.semibold};
      font-size: ${n.size.xs};
      background: linear-gradient(to right, #98f30c, #00f4a3);
      background-clip: text;
      -webkit-background-clip: text;
      line-height: 1;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    `,mainCloseBtnDivider:o`
      width: 1px;
      background: ${P.colors.gray[600]};
      height: 100%;
      border-radius: 999999px;
      color: transparent;
    `,mainCloseBtnIconContainer:o`
      position: relative;
      width: ${i[5]};
      height: ${i[5]};
      background: pink;
      border-radius: 999999px;
      overflow: hidden;
    `,mainCloseBtnIconOuter:o`
      width: ${i[5]};
      height: ${i[5]};
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      filter: blur(3px) saturate(1.8) contrast(2);
    `,mainCloseBtnIconInner:o`
      width: ${i[4]};
      height: ${i[4]};
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `,panelCloseBtn:o`
      position: absolute;
      cursor: pointer;
      z-index: 100001;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      background-color: ${t.darkGray[700]};
      &:hover {
        background-color: ${t.darkGray[500]};
      }

      top: 0;
      right: ${i[2]};
      transform: translate(0, -100%);
      border-right: ${t.darkGray[300]} 1px solid;
      border-left: ${t.darkGray[300]} 1px solid;
      border-top: ${t.darkGray[300]} 1px solid;
      border-bottom: none;
      border-radius: ${l.radius.sm} ${l.radius.sm} 0px 0px;
      padding: ${i[1]} ${i[1.5]} ${i[.5]} ${i[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        top: 100%;
        left: -${i[2.5]};
        height: ${i[1.5]};
        width: calc(100% + ${i[5]});
      }
    `,panelCloseBtnIcon:o`
      color: ${t.gray[400]};
      width: ${i[2]};
      height: ${i[2]};
    `,navigateButton:o`
      background: none;
      border: none;
      padding: 0 0 0 4px;
      margin: 0;
      color: ${t.gray[400]};
      font-size: ${g.md};
      cursor: pointer;
      line-height: 1;
      vertical-align: middle;
      margin-right: 0.5ch;
      flex-shrink: 0;
      &:hover {
        color: ${t.blue[300]};
      }
    `}};function Oe(){const e=bt(yt),[t]=le(Kt(e));return t}const Wt=e=>{try{const t=localStorage.getItem(e);return typeof t=="string"?JSON.parse(t):void 0}catch{return}};function Xe(e,t){const[n,i]=le();return Be(()=>{const l=Wt(e);i(typeof l>"u"||l===null?typeof t=="function"?t():t:l)}),[n,l=>{i(a=>{let f=l;typeof l=="function"&&(f=l(a));try{localStorage.setItem(e,JSON.stringify(f))}catch{}return f})}]}var Zt=G('<span><svg xmlns=http://www.w3.org/2000/svg width=12 height=12 fill=none viewBox="0 0 24 24"><path stroke=currentColor stroke-linecap=round stroke-linejoin=round stroke-width=2 d="M9 18l6-6-6-6">'),qe=G("<div>"),Qt=G("<button><span> "),Xt=G("<div><div><button> [<!> ... <!>]"),er=G("<button><span></span> 🔄 "),tr=G("<span>:"),rr=G("<span>");const vt=({expanded:e,style:t={}})=>{const n=Ct();return(()=>{var i=Zt(),h=i.firstChild;return _(l=>{var a=n().expander,f=V(n().expanderIcon(e));return a!==l.e&&d(i,l.e=a),f!==l.t&&s(h,"class",l.t=f),l},{e:void 0,t:void 0}),i})()};function ir(e,t){if(t<1)return[];let n=0;const i=[];for(;n<e.length;)i.push(e.slice(n,n+t)),n=n+t;return i}function nr(e){return Symbol.iterator in e}function Ue({value:e,defaultExpanded:t,pageSize:n=100,filterSubEntries:i,...h}){const[l,a]=le(!!t),f=()=>a(j=>!j),g=W(()=>typeof e()),o=W(()=>{let j=[];const ne=m=>{const y=t===!0?{[m.label]:!0}:t==null?void 0:t[m.label];return{...m,value:()=>m.value,defaultExpanded:y}};return Array.isArray(e())?j=e().map((m,y)=>ne({label:y.toString(),value:m})):e()!==null&&typeof e()=="object"&&nr(e())&&typeof e()[Symbol.iterator]=="function"?j=Array.from(e(),(m,y)=>ne({label:y.toString(),value:m})):typeof e()=="object"&&e()!==null&&(j=Object.entries(e()).map(([m,y])=>ne({label:m,value:y}))),i?i(j):j}),r=W(()=>ir(o(),n)),[v,p]=le([]),[k,$]=le(void 0),U=Ct(),H=()=>{$(e()())},Z=j=>M(Ue,Ve({value:e,filterSubEntries:i},h,j));return(()=>{var j=qe();return u(j,(()=>{var ne=X(()=>!!r().length);return()=>ne()?[(()=>{var m=Qt(),y=m.firstChild,F=y.firstChild;return m.$$click=()=>f(),u(m,M(vt,{get expanded(){return l()??!1}}),y),u(m,()=>h.label,y),u(y,()=>String(g).toLowerCase()==="iterable"?"(Iterable) ":"",F),u(y,()=>o().length,F),u(y,()=>o().length>1?"items":"item",null),_(re=>{var ie=U().expandButton,te=U().info;return ie!==re.e&&d(m,re.e=ie),te!==re.t&&d(y,re.t=te),re},{e:void 0,t:void 0}),m})(),X(()=>X(()=>!!(l()??!1))()?X(()=>r().length===1)()?(()=>{var m=qe();return u(m,()=>o().map((y,F)=>Z(y))),_(()=>d(m,U().subEntries)),m})():(()=>{var m=qe();return u(m,()=>r().map((y,F)=>(()=>{var re=Xt(),ie=re.firstChild,te=ie.firstChild,ge=te.firstChild,he=ge.nextSibling,ye=he.nextSibling,E=ye.nextSibling;return E.nextSibling,te.$$click=()=>p(D=>D.includes(F)?D.filter(Y=>Y!==F):[...D,F]),u(te,M(vt,{get expanded(){return v().includes(F)}}),ge),u(te,F*n,he),u(te,F*n+n-1,E),u(ie,(()=>{var D=X(()=>!!v().includes(F));return()=>D()?(()=>{var Y=qe();return u(Y,()=>y.map(J=>Z(J))),_(()=>d(Y,U().subEntries)),Y})():null})(),null),_(D=>{var Y=U().entry,J=V(U().labelButton,"labelButton");return Y!==D.e&&d(ie,D.e=Y),J!==D.t&&d(te,D.t=J),D},{e:void 0,t:void 0}),re})())),_(()=>d(m,U().subEntries)),m})():null)]:X(()=>g()==="function")()?M(Ue,{get label(){return(()=>{var m=er(),y=m.firstChild;return m.$$click=H,u(y,()=>h.label),_(()=>d(m,U().refreshValueBtn)),m})()},value:k,defaultExpanded:{}}):[(()=>{var m=tr(),y=m.firstChild;return u(m,()=>h.label,y),m})()," ",(()=>{var m=rr();return u(m,()=>Yt(e())),_(()=>d(m,U().value)),m})()]})()),_(()=>d(j,U().entry)),j})()}const or=e=>{const{colors:t,font:n,size:i}=P,{fontFamily:h,lineHeight:l,size:a}=n,f=e?De.bind({target:e}):De;return{entry:f`
      font-family: ${h.mono};
      font-size: ${a.xs};
      line-height: ${l.sm};
      outline: none;
      word-break: break-word;
    `,labelButton:f`
      cursor: pointer;
      color: inherit;
      font: inherit;
      outline: inherit;
      background: transparent;
      border: none;
      padding: 0;
    `,expander:f`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: ${i[3]};
      height: ${i[3]};
      padding-left: 3px;
      box-sizing: content-box;
    `,expanderIcon:g=>g?f`
          transform: rotate(90deg);
          transition: transform 0.1s ease;
        `:f`
        transform: rotate(0deg);
        transition: transform 0.1s ease;
      `,expandButton:f`
      display: flex;
      gap: ${i[1]};
      align-items: center;
      cursor: pointer;
      color: inherit;
      font: inherit;
      outline: inherit;
      background: transparent;
      border: none;
      padding: 0;
    `,value:f`
      color: ${t.purple[400]};
    `,subEntries:f`
      margin-left: ${i[2]};
      padding-left: ${i[2]};
      border-left: 2px solid ${t.darkGray[400]};
    `,info:f`
      color: ${t.gray[500]};
      font-size: ${a["2xs"]};
      padding-left: ${i[1]};
    `,refreshValueBtn:f`
      appearance: none;
      border: 0;
      cursor: pointer;
      background: transparent;
      color: inherit;
      padding: 0;
      font-family: ${h.mono};
      font-size: ${a.xs};
    `}};function Ct(){const e=bt(yt),[t]=le(or(e));return t}nt(["click"]);var lr=G("<div><div></div><div>/</div><div></div><div>/</div><div>");function tt(e){const t=["s","min","h","d"],n=[e/1e3,e/6e4,e/36e5,e/864e5];let i=0;for(let l=1;l<n.length&&!(n[l]<1);l++)i=l;return new Intl.NumberFormat(navigator.language,{compactDisplay:"short",notation:"compact",maximumFractionDigits:0}).format(n[i])+t[i]}function Ke({match:e,router:t}){const n=Oe();if(!e)return null;const i=t().looseRoutesById[e.routeId];if(!i.options.loader)return null;const h=Date.now()-e.updatedAt,l=i.options.staleTime??t().options.defaultStaleTime??0,a=i.options.gcTime??t().options.defaultGcTime??1800*1e3;return(()=>{var f=lr(),g=f.firstChild,o=g.nextSibling,r=o.nextSibling,v=r.nextSibling,p=v.nextSibling;return u(g,()=>tt(h)),u(r,()=>tt(l)),u(p,()=>tt(a)),_(()=>d(f,V(n().ageTicker(h>l)))),f})()}var sr=G("<button type=button>➔");function We({to:e,params:t,search:n,router:i}){const h=Oe();return(()=>{var l=sr();return l.$$click=a=>{a.stopPropagation(),i().navigate({to:e,params:t,search:n})},s(l,"title",`Navigate to ${e}`),_(()=>d(l,h().navigateButton)),l})()}nt(["click"]);var ar=G("<button><div>TANSTACK</div><div>TanStack Router v1"),dr=G("<div style=display:flex;align-items:center;width:100%><div style=flex-grow:1;min-width:0>"),cr=G("<code> "),Ne=G("<code>"),fr=G("<div><div role=button><div>"),Ze=G("<div>"),ur=G("<div><ul>"),gr=G('<div><button><svg xmlns=http://www.w3.org/2000/svg width=10 height=6 fill=none viewBox="0 0 10 6"><path stroke=currentColor stroke-linecap=round stroke-linejoin=round stroke-width=1.667 d="M1 1l4 4 4-4"></path></svg></button><div><div></div><div><div></div></div></div><div><div><div><span>Pathname</span></div><div><code></code></div><div><div><button type=button>Routes</button><button type=button>Matches</button><button type=button>History</button></div><div><div>age / staleTime / gcTime</div></div></div><div>'),hr=G("<div><span>masked"),$t=G("<div role=button><div>"),pr=G("<li><div>"),vr=G("<li>This panel displays the most recent 15 navigations."),$r=G("<div><div><div>Cached Matches</div><div>age / staleTime / gcTime</div></div><div>"),mr=G("<div><div>Match Details</div><div><div><div><div></div></div><div><div>ID:</div><div><code></code></div></div><div><div>State:</div><div></div></div><div><div>Last Updated:</div><div></div></div></div></div><div>Explorer</div><div>"),xr=G("<div>Loader Data"),br=G("<div><div><span>Search Params</span></div><div>"),yr=G("<span style=margin-left:0.5rem>"),kr=G('<button type=button aria-label="Copy value to clipboard"style=cursor:pointer>');const mt=15;function Cr(e){const{className:t,...n}=e,i=Oe();return(()=>{var h=ar(),l=h.firstChild,a=l.nextSibling;return it(h,Ve(n,{get class(){return V(i().logo,t?t():"")}}),!1,!0),_(f=>{var g=i().tanstackLogo,o=i().routerLogo;return g!==f.e&&d(l,f.e=g),o!==f.t&&d(a,f.t=o),f},{e:void 0,t:void 0}),h})()}function Qe(e){return(()=>{var t=dr(),n=t.firstChild;return u(t,()=>e.left,n),u(n,()=>e.children),u(t,()=>e.right,null),_(()=>d(t,e.class)),t})()}function wt({routerState:e,router:t,route:n,isRoot:i,activeId:h,setActiveId:l}){const a=Oe(),f=W(()=>e().pendingMatches||e().matches),g=W(()=>e().matches.find(v=>v.routeId===n.id)),o=W(()=>{var v,p;try{if((v=g())!=null&&v.params){const k=(p=g())==null?void 0:p.params,$=n.path||ht(n.id);if($.startsWith("$")){const U=$.slice(1);if(k[U])return`(${k[U]})`}}return""}catch{return""}}),r=W(()=>{if(i||!n.path)return;const v=Object.assign({},...f().map(k=>k.params)),p=Dt({path:n.fullPath,params:v,decodeCharMap:t().pathParamsDecodeCharMap});return p.isMissingParams?void 0:p.interpolatedPath});return(()=>{var v=fr(),p=v.firstChild,k=p.firstChild;return p.$$click=()=>{g()&&l(h()===n.id?"":n.id)},u(p,M(Qe,{get class(){return V(a().routesRow(!!g()))},get left(){return M(Ot,{get when(){return r()},children:$=>M(We,{get to(){return $()},router:t})})},get right(){return M(Ke,{get match(){return g()},router:t})},get children(){return[(()=>{var $=cr(),U=$.firstChild;return u($,()=>i?je:n.path||ht(n.id),U),_(()=>d($,a().code)),$})(),(()=>{var $=Ne();return u($,o),_(()=>d($,a().routeParamInfo)),$})()]}}),null),u(v,(()=>{var $=X(()=>{var U;return!!((U=n.children)!=null&&U.length)});return()=>$()?(()=>{var U=Ze();return u(U,()=>[...n.children].sort((H,Z)=>H.rank-Z.rank).map(H=>M(wt,{routerState:e,router:t,route:H,activeId:h,setActiveId:l}))),_(()=>d(U,a().nestedRouteRow(!!i))),U})():null})(),null),_($=>{var U=`Open match details for ${n.id}`,H=V(a().routesRowContainer(n.id===h(),!!g())),Z=V(a().matchIndicator(Vt(f(),n)));return U!==$.e&&s(p,"aria-label",$.e=U),H!==$.t&&d(p,$.t=H),Z!==$.a&&d(k,$.a=Z),$},{e:void 0,t:void 0,a:void 0}),v})()}const wr=function({...t}){const{isOpen:n=!0,setIsOpen:i,handleDragStart:h,router:l,routerState:a,shadowDOMTarget:f,...g}=t,{onCloseClick:o}=_t(),r=Oe(),{className:v,style:p,...k}=g;Ft(l,"No router was found for the TanStack Router Devtools. Please place the devtools in the <RouterProvider> component tree or pass the router instance to the devtools manually.");const[$,U]=Xe("tanstackRouterDevtoolsActiveTab","routes"),[H,Z]=Xe("tanstackRouterDevtoolsActiveRouteId",""),[j,ne]=le([]),[m,y]=le(!1);Be(()=>{const E=a().matches,D=E[E.length-1];if(!D)return;const Y=zt(()=>j()),J=Y[0],pe=J&&J.pathname===D.pathname&&JSON.stringify(J.search??{})===JSON.stringify(D.search??{});(!J||!pe)&&(Y.length>=mt&&y(!0),ne(ve=>{const I=[D,...ve];return I.splice(mt),I}))});const F=W(()=>[...a().pendingMatches??[],...a().matches,...a().cachedMatches].find(D=>D.routeId===H()||D.id===H())),re=W(()=>Object.keys(a().location.search).length),ie=W(()=>({...l(),state:a()})),te=W(()=>Object.fromEntries(qt(Object.keys(ie()),["state","routesById","routesByPath","options","manifest"].map(E=>D=>D!==E)).map(E=>[E,ie()[E]]).filter(E=>typeof E[1]!="function"&&!["__store","basepath","injectedHtml","subscribers","latestLoadPromise","navigateTimeout","resetNextScroll","tempLocationKey","latestLocation","routeTree","history"].includes(E[0])))),ge=W(()=>{var E;return(E=F())==null?void 0:E.loaderData}),he=W(()=>F()),ye=W(()=>a().location.search);return(()=>{var E=gr(),D=E.firstChild,Y=D.firstChild,J=D.nextSibling,pe=J.firstChild,ve=pe.nextSibling,I=ve.firstChild,N=J.nextSibling,ee=N.firstChild,L=ee.firstChild;L.firstChild;var q=L.nextSibling,se=q.firstChild,A=q.nextSibling,Q=A.firstChild,ce=Q.firstChild,$e=ce.nextSibling,fe=$e.nextSibling,Fe=Q.nextSibling,ze=A.nextSibling;return it(E,Ve({get class(){return V(r().devtoolsPanel,"TanStackRouterDevtoolsPanel",v?v():"")},get style(){return p?p():""}},k),!1,!0),u(E,h?(()=>{var c=Ze();return Mt(c,"mousedown",h,!0),_(()=>d(c,r().dragHandle)),c})():null,D),D.$$click=c=>{i&&i(!1),o(c)},u(pe,M(Cr,{"aria-hidden":!0,onClick:c=>{i&&i(!1),o(c)}})),u(I,M(Ue,{label:"Router",value:te,defaultExpanded:{state:{},context:{},options:{}},filterSubEntries:c=>c.filter(C=>typeof C.value()!="function")})),u(L,(()=>{var c=X(()=>!!a().location.maskedLocation);return()=>c()?(()=>{var C=hr(),z=C.firstChild;return _(S=>{var B=r().maskedBadgeContainer,T=r().maskedBadge;return B!==S.e&&d(C,S.e=B),T!==S.t&&d(z,S.t=T),S},{e:void 0,t:void 0}),C})():null})(),null),u(se,()=>a().location.pathname),u(q,(()=>{var c=X(()=>!!a().location.maskedLocation);return()=>c()?(()=>{var C=Ne();return u(C,()=>{var z;return(z=a().location.maskedLocation)==null?void 0:z.pathname}),_(()=>d(C,r().maskedLocation)),C})():null})(),null),ce.$$click=()=>{U("routes")},$e.$$click=()=>{U("matches")},fe.$$click=()=>{U("history")},u(ze,M(Bt,{get children(){return[M(et,{get when(){return $()==="routes"},get children(){return M(wt,{routerState:a,router:l,get route(){return l().routeTree},isRoot:!0,activeId:H,setActiveId:Z})}}),M(et,{get when(){return $()==="matches"},get children(){var c=Ze();return u(c,()=>{var C,z;return(z=(C=a().pendingMatches)!=null&&C.length?a().pendingMatches:a().matches)==null?void 0:z.map((S,B)=>(()=>{var T=$t(),b=T.firstChild;return T.$$click=()=>Z(H()===S.id?"":S.id),u(T,M(Qe,{get left(){return M(We,{get to(){return S.pathname},get params(){return S.params},get search(){return S.search},router:l})},get right(){return M(Ke,{match:S,router:l})},get children(){var w=Ne();return u(w,()=>`${S.routeId===je?je:S.pathname}`),_(()=>d(w,r().matchID)),w}}),null),_(w=>{var K=`Open match details for ${S.id}`,R=V(r().matchRow(S===F())),oe=V(r().matchIndicator(rt(S)));return K!==w.e&&s(T,"aria-label",w.e=K),R!==w.t&&d(T,w.t=R),oe!==w.a&&d(b,w.a=oe),w},{e:void 0,t:void 0,a:void 0}),T})())}),c}}),M(et,{get when(){return $()==="history"},get children(){var c=ur(),C=c.firstChild;return u(C,M(Ut,{get each(){return j()},children:(z,S)=>(()=>{var B=pr(),T=B.firstChild;return u(B,M(Qe,{get left(){return M(We,{get to(){return z.pathname},get params(){return z.params},get search(){return z.search},router:l})},get right(){return M(Ke,{match:z,router:l})},get children(){var b=Ne();return u(b,()=>`${z.routeId===je?je:z.pathname}`),_(()=>d(b,r().matchID)),b}}),null),_(b=>{var w=V(r().matchRow(z===F())),K=V(r().matchIndicator(S()===0?"green":"gray"));return w!==b.e&&d(B,b.e=w),K!==b.t&&d(T,b.t=K),b},{e:void 0,t:void 0}),B})()}),null),u(C,(()=>{var z=X(()=>!!m());return()=>z()?(()=>{var S=vr();return _(()=>d(S,r().historyOverflowContainer)),S})():null})(),null),c}})]}})),u(N,(()=>{var c=X(()=>!!a().cachedMatches.length);return()=>c()?(()=>{var C=$r(),z=C.firstChild,S=z.firstChild,B=S.nextSibling,T=z.nextSibling;return u(T,()=>a().cachedMatches.map(b=>(()=>{var w=$t(),K=w.firstChild;return w.$$click=()=>Z(H()===b.id?"":b.id),u(w,M(Qe,{get left(){return M(We,{get to(){return b.pathname},get params(){return b.params},get search(){return b.search},router:l})},get right(){return M(Ke,{match:b,router:l})},get children(){var R=Ne();return u(R,()=>`${b.id}`),_(()=>d(R,r().matchID)),R}}),null),_(R=>{var oe=`Open match details for ${b.id}`,ae=V(r().matchRow(b===F())),ue=V(r().matchIndicator(rt(b)));return oe!==R.e&&s(w,"aria-label",R.e=oe),ae!==R.t&&d(w,R.t=ae),ue!==R.a&&d(K,R.a=ue),R},{e:void 0,t:void 0,a:void 0}),w})())),_(b=>{var w=r().cachedMatchesContainer,K=r().detailsHeader,R=r().detailsHeaderInfo;return w!==b.e&&d(C,b.e=w),K!==b.t&&d(z,b.t=K),R!==b.a&&d(B,b.a=R),b},{e:void 0,t:void 0,a:void 0}),C})():null})(),null),u(E,(()=>{var c=X(()=>{var C;return!!(F()&&((C=F())!=null&&C.status))});return()=>c()?(()=>{var C=mr(),z=C.firstChild,S=z.nextSibling,B=S.firstChild,T=B.firstChild,b=T.firstChild,w=T.nextSibling,K=w.firstChild,R=K.nextSibling,oe=R.firstChild,ae=w.nextSibling,ue=ae.firstChild,Se=ue.nextSibling,ke=ae.nextSibling,Me=ke.firstChild,me=Me.nextSibling,Ce=S.nextSibling,we=Ce.nextSibling;return u(b,(()=>{var x=X(()=>{var O,de;return!!(((O=F())==null?void 0:O.status)==="success"&&((de=F())!=null&&de.isFetching))});return()=>{var O;return x()?"fetching":(O=F())==null?void 0:O.status}})()),u(oe,()=>{var x;return(x=F())==null?void 0:x.id}),u(Se,(()=>{var x=X(()=>{var O;return!!((O=a().pendingMatches)!=null&&O.find(de=>{var xe;return de.id===((xe=F())==null?void 0:xe.id)}))});return()=>x()?"Pending":a().matches.find(O=>{var de;return O.id===((de=F())==null?void 0:de.id)})?"Active":"Cached"})()),u(me,(()=>{var x=X(()=>{var O;return!!((O=F())!=null&&O.updatedAt)});return()=>{var O;return x()?new Date((O=F())==null?void 0:O.updatedAt).toLocaleTimeString():"N/A"}})()),u(C,(()=>{var x=X(()=>!!ge());return()=>x()?[(()=>{var O=xr();return _(()=>d(O,r().detailsHeader)),O})(),(()=>{var O=Ze();return u(O,M(Ue,{label:"loaderData",value:ge,defaultExpanded:{}})),_(()=>d(O,r().detailsContent)),O})()]:null})(),Ce),u(we,M(Ue,{label:"Match",value:he,defaultExpanded:{}})),_(x=>{var Le,He;var O=r().thirdContainer,de=r().detailsHeader,xe=r().matchDetails,Je=r().matchStatus((Le=F())==null?void 0:Le.status,(He=F())==null?void 0:He.isFetching),Te=r().matchDetailsInfoLabel,Ye=r().matchDetailsInfo,Ee=r().matchDetailsInfoLabel,Ie=r().matchDetailsInfo,Ge=r().matchDetailsInfoLabel,Ae=r().matchDetailsInfo,Pe=r().detailsHeader,Re=r().detailsContent;return O!==x.e&&d(C,x.e=O),de!==x.t&&d(z,x.t=de),xe!==x.a&&d(B,x.a=xe),Je!==x.o&&d(T,x.o=Je),Te!==x.i&&d(w,x.i=Te),Ye!==x.n&&d(R,x.n=Ye),Ee!==x.s&&d(ae,x.s=Ee),Ie!==x.h&&d(Se,x.h=Ie),Ge!==x.r&&d(ke,x.r=Ge),Ae!==x.d&&d(me,x.d=Ae),Pe!==x.l&&d(Ce,x.l=Pe),Re!==x.u&&d(we,x.u=Re),x},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0}),C})():null})(),null),u(E,(()=>{var c=X(()=>!!re());return()=>c()?(()=>{var C=br(),z=C.firstChild;z.firstChild;var S=z.nextSibling;return u(z,typeof navigator<"u"?(()=>{var B=yr();return u(B,M(Sr,{getValue:()=>{const T=a().location.search;return JSON.stringify(T)}})),B})():null,null),u(S,M(Ue,{value:ye,get defaultExpanded(){return Object.keys(a().location.search).reduce((B,T)=>(B[T]={},B),{})}})),_(B=>{var T=r().fourthContainer,b=r().detailsHeader,w=r().detailsContent;return T!==B.e&&d(C,B.e=T),b!==B.t&&d(z,B.t=b),w!==B.a&&d(S,B.a=w),B},{e:void 0,t:void 0,a:void 0}),C})():null})(),null),_(c=>{var C=r().panelCloseBtn,z=r().panelCloseBtnIcon,S=r().firstContainer,B=r().row,T=r().routerExplorerContainer,b=r().routerExplorer,w=r().secondContainer,K=r().matchesContainer,R=r().detailsHeader,oe=r().detailsContent,ae=r().detailsHeader,ue=r().routeMatchesToggle,Se=$()==="routes",ke=V(r().routeMatchesToggleBtn($()==="routes",!0)),Me=$()==="matches",me=V(r().routeMatchesToggleBtn($()==="matches",!0)),Ce=$()==="history",we=V(r().routeMatchesToggleBtn($()==="history",!1)),x=r().detailsHeaderInfo,O=V(r().routesContainer);return C!==c.e&&d(D,c.e=C),z!==c.t&&s(Y,"class",c.t=z),S!==c.a&&d(J,c.a=S),B!==c.o&&d(pe,c.o=B),T!==c.i&&d(ve,c.i=T),b!==c.n&&d(I,c.n=b),w!==c.s&&d(N,c.s=w),K!==c.h&&d(ee,c.h=K),R!==c.r&&d(L,c.r=R),oe!==c.d&&d(q,c.d=oe),ae!==c.l&&d(A,c.l=ae),ue!==c.u&&d(Q,c.u=ue),Se!==c.c&&(ce.disabled=c.c=Se),ke!==c.w&&d(ce,c.w=ke),Me!==c.m&&($e.disabled=c.m=Me),me!==c.f&&d($e,c.f=me),Ce!==c.y&&(fe.disabled=c.y=Ce),we!==c.g&&d(fe,c.g=we),x!==c.p&&d(Fe,c.p=x),O!==c.b&&d(ze,c.b=O),c},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0}),E})()};function Sr({getValue:e}){const[t,n]=le(!1);let i=null;const h=async()=>{var l;if(typeof navigator>"u"||!((l=navigator.clipboard)!=null&&l.writeText)){console.warn("TanStack Router Devtools: Clipboard API unavailable");return}try{const a=e();await navigator.clipboard.writeText(a),n(!0),i&&clearTimeout(i),i=setTimeout(()=>n(!1),2500)}catch(a){console.error("TanStack Router Devtools: Failed to copy",a)}};return Tt(()=>{i&&clearTimeout(i)}),(()=>{var l=kr();return l.$$click=h,u(l,()=>t()?"✅":"📋"),_(()=>s(l,"title",t()?"Copied!":"Copy")),l})()}nt(["click","mousedown"]);var _r=G('<svg xmlns=http://www.w3.org/2000/svg enable-background="new 0 0 634 633"viewBox="0 0 634 633"><g transform=translate(1)><linearGradient x1=-641.486 x2=-641.486 y1=856.648 y2=855.931 gradientTransform="matrix(633 0 0 -633 406377 542258)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#6bdaff></stop><stop offset=0.319 stop-color=#f9ffb5></stop><stop offset=0.706 stop-color=#ffa770></stop><stop offset=1 stop-color=#ff7373></stop></linearGradient><circle cx=316.5 cy=316.5 r=316.5 fill-rule=evenodd clip-rule=evenodd></circle><defs><filter width=454 height=396.9 x=-137.5 y=412 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=454 height=396.9 x=-137.5 y=412 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><ellipse cx=89.5 cy=610.5 fill=#015064 fill-rule=evenodd stroke=#00CFE2 stroke-width=25 clip-rule=evenodd rx=214.5 ry=186></ellipse><defs><filter width=454 height=396.9 x=316.5 y=412 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=454 height=396.9 x=316.5 y=412 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><ellipse cx=543.5 cy=610.5 fill=#015064 fill-rule=evenodd stroke=#00CFE2 stroke-width=25 clip-rule=evenodd rx=214.5 ry=186></ellipse><defs><filter width=454 height=396.9 x=-137.5 y=450 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=454 height=396.9 x=-137.5 y=450 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><ellipse cx=89.5 cy=648.5 fill=#015064 fill-rule=evenodd stroke=#00A8B8 stroke-width=25 clip-rule=evenodd rx=214.5 ry=186></ellipse><defs><filter width=454 height=396.9 x=316.5 y=450 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=454 height=396.9 x=316.5 y=450 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><ellipse cx=543.5 cy=648.5 fill=#015064 fill-rule=evenodd stroke=#00A8B8 stroke-width=25 clip-rule=evenodd rx=214.5 ry=186></ellipse><defs><filter width=454 height=396.9 x=-137.5 y=486 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=454 height=396.9 x=-137.5 y=486 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><ellipse cx=89.5 cy=684.5 fill=#015064 fill-rule=evenodd stroke=#007782 stroke-width=25 clip-rule=evenodd rx=214.5 ry=186></ellipse><defs><filter width=454 height=396.9 x=316.5 y=486 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=454 height=396.9 x=316.5 y=486 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><ellipse cx=543.5 cy=684.5 fill=#015064 fill-rule=evenodd stroke=#007782 stroke-width=25 clip-rule=evenodd rx=214.5 ry=186></ellipse><defs><filter width=176.9 height=129.3 x=272.2 y=308 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=176.9 height=129.3 x=272.2 y=308 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><g><path fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11 d="M436 403.2l-5 28.6m-140-90.3l-10.9 62m52.8-19.4l-4.3 27.1"></path><linearGradient x1=-645.656 x2=-646.499 y1=854.878 y2=854.788 gradientTransform="matrix(-184.159 -32.4722 11.4608 -64.9973 -128419.844 34938.836)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ee2700></stop><stop offset=1 stop-color=#ff008e></stop></linearGradient><path fill-rule=evenodd d="M344.1 363l97.7 17.2c5.8 2.1 8.2 6.2 7.1 12.1-1 5.9-4.7 9.2-11 9.9l-106-18.7-57.5-59.2c-3.2-4.8-2.9-9.1.8-12.8 3.7-3.7 8.3-4.4 13.7-2.1l55.2 53.6z"clip-rule=evenodd></path><path fill=#D8D8D8 fill-rule=evenodd stroke=#FFF stroke-linecap=round stroke-linejoin=bevel stroke-width=7 d="M428.3 384.5l.9-6.5m-33.9 1.5l.9-6.5m-34 .5l.9-6.1m-38.9-16.1l4.2-3.9m-25.2-16.1l4.2-3.9"clip-rule=evenodd></path></g><defs><filter width=280.6 height=317.4 x=73.2 y=113.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=280.6 height=317.4 x=73.2 y=113.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><g><linearGradient x1=-646.8 x2=-646.8 y1=854.844 y2=853.844 gradientTransform="matrix(-100.1751 48.8587 -97.9753 -200.879 19124.773 203538.61)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#a17500></stop><stop offset=1 stop-color=#5d2100></stop></linearGradient><path fill-rule=evenodd d="M192.3 203c8.1 37.3 14 73.6 17.8 109.1 3.8 35.4 2.8 75.2-2.9 119.2l61.2-16.7c-15.6-59-25.2-97.9-28.6-116.6-3.4-18.7-10.8-51.8-22.2-99.6l-25.3 4.6"clip-rule=evenodd></path><linearGradient x1=-635.467 x2=-635.467 y1=852.115 y2=851.115 gradientTransform="matrix(92.6873 4.8575 2.0257 -38.6535 57323.695 36176.047)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#2f8a00></stop><stop offset=1 stop-color=#90ff57></stop></linearGradient><path fill-rule=evenodd stroke=#2F8A00 stroke-width=13 d="M195 183.9s-12.6-22.1-36.5-29.9c-15.9-5.2-34.4-1.5-55.5 11.1 15.9 14.3 29.5 22.6 40.7 24.9 16.8 3.6 51.3-6.1 51.3-6.1z"clip-rule=evenodd></path><linearGradient x1=-636.573 x2=-636.573 y1=855.444 y2=854.444 gradientTransform="matrix(109.9945 5.7646 6.3597 -121.3507 64719.133 107659.336)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#2f8a00></stop><stop offset=1 stop-color=#90ff57></stop></linearGradient><path fill-rule=evenodd stroke=#2F8A00 stroke-width=13 d="M194.9 184.5s-47.5-8.5-83.2 15.7c-23.8 16.2-34.3 49.3-31.6 99.3 30.3-27.8 52.1-48.5 65.2-61.9 19.8-20 49.6-53.1 49.6-53.1z"clip-rule=evenodd></path><linearGradient x1=-632.145 x2=-632.145 y1=854.174 y2=853.174 gradientTransform="matrix(62.9558 3.2994 3.5021 -66.8246 37035.367 59284.227)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#2f8a00></stop><stop offset=1 stop-color=#90ff57></stop></linearGradient><path fill-rule=evenodd stroke=#2F8A00 stroke-width=13 d="M195 183.9c-.8-21.9 6-38 20.6-48.2 14.6-10.2 29.8-15.3 45.5-15.3-6.1 21.4-14.5 35.8-25.2 43.4-10.7 7.5-24.4 14.2-40.9 20.1z"clip-rule=evenodd></path><linearGradient x1=-638.224 x2=-638.224 y1=853.801 y2=852.801 gradientTransform="matrix(152.4666 7.9904 3.0934 -59.0251 94939.86 55646.855)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#2f8a00></stop><stop offset=1 stop-color=#90ff57></stop></linearGradient><path fill-rule=evenodd stroke=#2F8A00 stroke-width=13 d="M194.9 184.5c31.9-30 64.1-39.7 96.7-29 32.6 10.7 50.8 30.4 54.6 59.1-35.2-5.5-60.4-9.6-75.8-12.1-15.3-2.6-40.5-8.6-75.5-18z"clip-rule=evenodd></path><linearGradient x1=-637.723 x2=-637.723 y1=855.103 y2=854.103 gradientTransform="matrix(136.467 7.1519 5.2165 -99.5377 82830.875 89859.578)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#2f8a00></stop><stop offset=1 stop-color=#90ff57></stop></linearGradient><path fill-rule=evenodd stroke=#2F8A00 stroke-width=13 d="M194.9 184.5c35.8-7.6 65.6-.2 89.2 22 23.6 22.2 37.7 49 42.3 80.3-39.8-9.7-68.3-23.8-85.5-42.4-17.2-18.5-32.5-38.5-46-59.9z"clip-rule=evenodd></path><linearGradient x1=-631.79 x2=-631.79 y1=855.872 y2=854.872 gradientTransform="matrix(60.8683 3.19 8.7771 -167.4773 31110.818 145537.61)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#2f8a00></stop><stop offset=1 stop-color=#90ff57></stop></linearGradient><path fill-rule=evenodd stroke=#2F8A00 stroke-width=13 d="M194.9 184.5c-33.6 13.8-53.6 35.7-60.1 65.6-6.5 29.9-3.6 63.1 8.7 99.6 27.4-40.3 43.2-69.6 47.4-88 4.2-18.3 5.5-44.1 4-77.2z"clip-rule=evenodd></path><path fill=none stroke=#2F8A00 stroke-linecap=round stroke-width=8 d="M196.5 182.3c-14.8 21.6-25.1 41.4-30.8 59.4-5.7 18-9.4 33-11.1 45.1"></path><path fill=none stroke=#2F8A00 stroke-linecap=round stroke-width=8 d="M194.8 185.7c-24.4 1.7-43.8 9-58.1 21.8-14.3 12.8-24.7 25.4-31.3 37.8m99.1-68.9c29.7-6.7 52-8.4 67-5 15 3.4 26.9 8.7 35.8 15.9m-110.8-5.9c20.3 9.9 38.2 20.5 53.9 31.9 15.7 11.4 27.4 22.1 35.1 32"></path></g><defs><filter width=532 height=633 x=50.5 y=399 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=532 height=633 x=50.5 y=399 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><linearGradient x1=-641.104 x2=-641.278 y1=856.577 y2=856.183 gradientTransform="matrix(532 0 0 -633 341484.5 542657)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#fff400></stop><stop offset=1 stop-color=#3c8700></stop></linearGradient><ellipse cx=316.5 cy=715.5 fill-rule=evenodd clip-rule=evenodd rx=266 ry=316.5></ellipse><defs><filter width=288 height=283 x=391 y=-24 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"></feColorMatrix></filter></defs><mask width=288 height=283 x=391 y=-24 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#FFF fill-rule=evenodd clip-rule=evenodd></circle></g></mask><g><g transform="translate(397 -24)"><linearGradient x1=-1036.672 x2=-1036.672 y1=880.018 y2=879.018 gradientTransform="matrix(227 0 0 -227 235493 199764)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffdf00></stop><stop offset=1 stop-color=#ff9d00></stop></linearGradient><circle cx=168.5 cy=113.5 r=113.5 fill-rule=evenodd clip-rule=evenodd></circle><linearGradient x1=-1017.329 x2=-1018.602 y1=658.003 y2=657.998 gradientTransform="matrix(30 0 0 -1 30558 771)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffa400></stop><stop offset=1 stop-color=#ff5e00></stop></linearGradient><path fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12 d="M30 113H0"></path><linearGradient x1=-1014.501 x2=-1015.774 y1=839.985 y2=839.935 gradientTransform="matrix(26.5 0 0 -5.5 26925 4696.5)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffa400></stop><stop offset=1 stop-color=#ff5e00></stop></linearGradient><path fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12 d="M33.5 79.5L7 74"></path><linearGradient x1=-1016.59 x2=-1017.862 y1=852.671 y2=852.595 gradientTransform="matrix(29 0 0 -8 29523 6971)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffa400></stop><stop offset=1 stop-color=#ff5e00></stop></linearGradient><path fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12 d="M34 146l-29 8"></path><linearGradient x1=-1011.984 x2=-1013.257 y1=863.523 y2=863.229 gradientTransform="matrix(24 0 0 -13 24339 11407)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffa400></stop><stop offset=1 stop-color=#ff5e00></stop></linearGradient><path fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12 d="M45 177l-24 13"></path><linearGradient x1=-1006.673 x2=-1007.946 y1=869.279 y2=868.376 gradientTransform="matrix(20 0 0 -19 20205 16720)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffa400></stop><stop offset=1 stop-color=#ff5e00></stop></linearGradient><path fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12 d="M67 204l-20 19"></path><linearGradient x1=-992.85 x2=-993.317 y1=871.258 y2=870.258 gradientTransform="matrix(13.8339 0 0 -22.8467 13825.796 20131.938)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffa400></stop><stop offset=1 stop-color=#ff5e00></stop></linearGradient><path fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12 d="M94.4 227l-13.8 22.8"></path><linearGradient x1=-953.835 x2=-953.965 y1=871.9 y2=870.9 gradientTransform="matrix(7.5 0 0 -24.5 7278 21605)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffa400></stop><stop offset=1 stop-color=#ff5e00></stop></linearGradient><path fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12 d="M127.5 243.5L120 268"></path><linearGradient x1=244.504 x2=244.496 y1=871.898 y2=870.898 gradientTransform="matrix(.5 0 0 -24.5 45.5 21614)"gradientUnits=userSpaceOnUse><stop offset=0 stop-color=#ffa400></stop><stop offset=1 stop-color=#ff5e00></stop></linearGradient><path fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12 d="M167.5 252.5l.5 24.5">');function xt(){const e=Gt();return(()=>{var t=_r(),n=t.firstChild,i=n.firstChild,h=i.nextSibling,l=h.nextSibling,a=l.firstChild,f=l.nextSibling,g=f.firstChild,o=f.nextSibling,r=o.nextSibling,v=r.firstChild,p=r.nextSibling,k=p.firstChild,$=p.nextSibling,U=$.nextSibling,H=U.firstChild,Z=U.nextSibling,j=Z.firstChild,ne=Z.nextSibling,m=ne.nextSibling,y=m.firstChild,F=m.nextSibling,re=F.firstChild,ie=F.nextSibling,te=ie.nextSibling,ge=te.firstChild,he=te.nextSibling,ye=he.firstChild,E=he.nextSibling,D=E.nextSibling,Y=D.firstChild,J=D.nextSibling,pe=J.firstChild,ve=J.nextSibling,I=ve.nextSibling,N=I.firstChild,ee=I.nextSibling,L=ee.firstChild,q=ee.nextSibling,se=q.firstChild,A=se.nextSibling,Q=A.nextSibling,ce=q.nextSibling,$e=ce.firstChild,fe=ce.nextSibling,Fe=fe.firstChild,ze=fe.nextSibling,c=ze.firstChild,C=c.nextSibling,z=C.nextSibling,S=z.nextSibling,B=S.nextSibling,T=B.nextSibling,b=T.nextSibling,w=b.nextSibling,K=w.nextSibling,R=K.nextSibling,oe=R.nextSibling,ae=oe.nextSibling,ue=ae.nextSibling,Se=ue.nextSibling,ke=ze.nextSibling,Me=ke.firstChild,me=ke.nextSibling,Ce=me.firstChild,we=me.nextSibling,x=we.nextSibling,O=x.nextSibling,de=O.firstChild,xe=O.nextSibling,Je=xe.firstChild,Te=xe.nextSibling,Ye=Te.firstChild,Ee=Ye.firstChild,Ie=Ee.nextSibling,Ge=Ie.nextSibling,Ae=Ge.nextSibling,Pe=Ae.nextSibling,Re=Pe.nextSibling,Le=Re.nextSibling,He=Le.nextSibling,ot=He.nextSibling,lt=ot.nextSibling,st=lt.nextSibling,at=st.nextSibling,dt=at.nextSibling,ct=dt.nextSibling,ft=ct.nextSibling,ut=ft.nextSibling,gt=ut.nextSibling,St=gt.nextSibling;return s(i,"id",`a-${e}`),s(h,"fill",`url(#a-${e})`),s(a,"id",`b-${e}`),s(f,"id",`c-${e}`),s(g,"filter",`url(#b-${e})`),s(o,"mask",`url(#c-${e})`),s(v,"id",`d-${e}`),s(p,"id",`e-${e}`),s(k,"filter",`url(#d-${e})`),s($,"mask",`url(#e-${e})`),s(H,"id",`f-${e}`),s(Z,"id",`g-${e}`),s(j,"filter",`url(#f-${e})`),s(ne,"mask",`url(#g-${e})`),s(y,"id",`h-${e}`),s(F,"id",`i-${e}`),s(re,"filter",`url(#h-${e})`),s(ie,"mask",`url(#i-${e})`),s(ge,"id",`j-${e}`),s(he,"id",`k-${e}`),s(ye,"filter",`url(#j-${e})`),s(E,"mask",`url(#k-${e})`),s(Y,"id",`l-${e}`),s(J,"id",`m-${e}`),s(pe,"filter",`url(#l-${e})`),s(ve,"mask",`url(#m-${e})`),s(N,"id",`n-${e}`),s(ee,"id",`o-${e}`),s(L,"filter",`url(#n-${e})`),s(q,"mask",`url(#o-${e})`),s(A,"id",`p-${e}`),s(Q,"fill",`url(#p-${e})`),s($e,"id",`q-${e}`),s(fe,"id",`r-${e}`),s(Fe,"filter",`url(#q-${e})`),s(ze,"mask",`url(#r-${e})`),s(c,"id",`s-${e}`),s(C,"fill",`url(#s-${e})`),s(z,"id",`t-${e}`),s(S,"fill",`url(#t-${e})`),s(B,"id",`u-${e}`),s(T,"fill",`url(#u-${e})`),s(b,"id",`v-${e}`),s(w,"fill",`url(#v-${e})`),s(K,"id",`w-${e}`),s(R,"fill",`url(#w-${e})`),s(oe,"id",`x-${e}`),s(ae,"fill",`url(#x-${e})`),s(ue,"id",`y-${e}`),s(Se,"fill",`url(#y-${e})`),s(Me,"id",`z-${e}`),s(me,"id",`A-${e}`),s(Ce,"filter",`url(#z-${e})`),s(we,"id",`B-${e}`),s(x,"fill",`url(#B-${e})`),s(x,"mask",`url(#A-${e})`),s(de,"id",`C-${e}`),s(xe,"id",`D-${e}`),s(Je,"filter",`url(#C-${e})`),s(Te,"mask",`url(#D-${e})`),s(Ee,"id",`E-${e}`),s(Ie,"fill",`url(#E-${e})`),s(Ge,"id",`F-${e}`),s(Ae,"stroke",`url(#F-${e})`),s(Pe,"id",`G-${e}`),s(Re,"stroke",`url(#G-${e})`),s(Le,"id",`H-${e}`),s(He,"stroke",`url(#H-${e})`),s(ot,"id",`I-${e}`),s(lt,"stroke",`url(#I-${e})`),s(st,"id",`J-${e}`),s(at,"stroke",`url(#J-${e})`),s(dt,"id",`K-${e}`),s(ct,"stroke",`url(#K-${e})`),s(ft,"id",`L-${e}`),s(ut,"stroke",`url(#L-${e})`),s(gt,"id",`M-${e}`),s(St,"stroke",`url(#M-${e})`),t})()}var Fr=G("<button type=button><div><div></div><div></div></div><div>-</div><div>TanStack Router");function Mr({initialIsOpen:e,panelProps:t={},closeButtonProps:n={},toggleButtonProps:i={},position:h="bottom-left",containerElement:l="footer",router:a,routerState:f,shadowDOMTarget:g}){const[o,r]=le();let v;const[p,k]=Xe("tanstackRouterDevtoolsOpen",e),[$,U]=Xe("tanstackRouterDevtoolsHeight",null),[H,Z]=le(!1),[j,ne]=le(!1),m=Jt(),y=Oe(),F=(I,N)=>{if(N.button!==0)return;ne(!0);const ee={originalHeight:(I==null?void 0:I.getBoundingClientRect().height)??0,pageY:N.pageY},L=se=>{const A=ee.pageY-se.pageY,Q=ee.originalHeight+A;U(Q),Q<70?k(!1):k(!0)},q=()=>{ne(!1),document.removeEventListener("mousemove",L),document.removeEventListener("mouseUp",q)};document.addEventListener("mousemove",L),document.addEventListener("mouseup",q)};p(),Be(()=>{Z(p()??!1)}),Be(()=>{var I,N,ee;if(H()){const L=(N=(I=o())==null?void 0:I.parentElement)==null?void 0:N.style.paddingBottom,q=()=>{var A;const se=v.getBoundingClientRect().height;(A=o())!=null&&A.parentElement&&r(Q=>(Q!=null&&Q.parentElement&&(Q.parentElement.style.paddingBottom=`${se}px`),Q))};if(q(),typeof window<"u")return window.addEventListener("resize",q),()=>{var se;window.removeEventListener("resize",q),(se=o())!=null&&se.parentElement&&typeof L=="string"&&r(A=>(A.parentElement.style.paddingBottom=L,A))}}else(ee=o())!=null&&ee.parentElement&&r(L=>(L!=null&&L.parentElement&&L.parentElement.removeAttribute("style"),L))}),Be(()=>{if(o()){const I=o(),N=getComputedStyle(I).fontSize;I==null||I.style.setProperty("--tsrd-font-size",N)}});const{style:re={},...ie}=t,{style:te={},onClick:ge,...he}=n,{onClick:ye,class:E,...D}=i;if(!m())return null;const Y=W(()=>$()??500),J=W(()=>V(y().devtoolsPanelContainer,y().devtoolsPanelContainerVisibility(!!p()),y().devtoolsPanelContainerResizing(j),y().devtoolsPanelContainerAnimation(H(),Y()+16))),pe=W(()=>({height:`${Y()}px`,...re||{}})),ve=W(()=>V(y().mainCloseBtn,y().mainCloseBtnPosition(h),y().mainCloseBtnAnimation(!!p()),E));return M(It,{component:l,ref:r,class:"TanStackRouterDevtools",get children(){return[M(Et.Provider,{value:{onCloseClick:ge??(()=>{})},get children(){return M(wr,Ve({ref(I){var N=v;typeof N=="function"?N(I):v=I}},ie,{router:a,routerState:f,className:J,style:pe,get isOpen(){return H()},setIsOpen:k,handleDragStart:I=>F(v,I),shadowDOMTarget:g}))}}),(()=>{var I=Fr(),N=I.firstChild,ee=N.firstChild,L=ee.nextSibling,q=N.nextSibling,se=q.nextSibling;return it(I,Ve(D,{"aria-label":"Open TanStack Router Devtools",onClick:A=>{k(!0),ye&&ye(A)},get class(){return ve()}}),!1,!0),u(ee,M(xt,{})),u(L,M(xt,{})),_(A=>{var Q=y().mainCloseBtnIconContainer,ce=y().mainCloseBtnIconOuter,$e=y().mainCloseBtnIconInner,fe=y().mainCloseBtnDivider,Fe=y().routerLogoCloseButton;return Q!==A.e&&d(N,A.e=Q),ce!==A.t&&d(ee,A.t=ce),$e!==A.a&&d(L,A.a=$e),fe!==A.o&&d(q,A.o=fe),Fe!==A.i&&d(se,A.i=Fe),A},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),I})()]}})}export{Mr as FloatingTanStackRouterDevtools,Mr as default};
