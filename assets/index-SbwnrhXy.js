(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();const je="themis_";function W(e,t){try{localStorage.setItem(je+e,JSON.stringify(t))}catch{}}function ne(e,t=null){try{const n=localStorage.getItem(je+e);return n===null?t:JSON.parse(n)}catch{return t}}const Ge="theme",Ue=["dark","light"];function tt(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function We(e){document.documentElement.setAttribute("data-theme",e)}function Ve(){const e=ne(Ge),t=Ue.includes(e)?e:tt();return We(t),t}function nt(e){return Ue.includes(e)?(We(e),W(Ge,e),e):Ve()}function st(e,t){const n=[],i=[],r=new Set,s=e.split(`
`).filter(d=>d.trim()!=="");for(let d=0;d<s.length;d++){const a=d+1,p=s[d].split("	");if(p.length<8){i.push({row:a,message:`${a}行目: 列数が不足しています（${p.length}列）。最低8列（バンド名、6パート、時間）が必要です。`});continue}const L=p[p.length-1].trim(),v=p[p.length-2].trim(),o=p[p.length-3].trim(),y=p[p.length-4].trim(),B=p[p.length-5].trim(),P=p[p.length-6].trim(),k=p[p.length-7].trim(),g=p.slice(0,p.length-7).join("	").trim();if(!g){i.push({row:a,message:`${a}行目: バンド名が空です。`});continue}const q=[{label:"Vo.",value:k},{label:"L.Gt",value:P},{label:"B.Gt",value:B},{label:"Ba.",value:y},{label:"Dr.",value:o},{label:"Key.",value:v}];let V=!1;for(const b of q)b.value.includes(" ")&&(i.push({row:a,message:`${a}行目: ${b.label}のセル「${b.value}」にスペースが含まれています。セル内にスペースは使用できません。`}),V=!0);if(V)continue;const f=at(L,a);if(f.error){i.push(f.error);continue}const I=[k,P,B,y,o,v];for(const b of I)b&&b!==t&&r.add(b);n.push({name:g,members:I,estimatedTime:f.value})}return{bands:n,errors:i,players:Array.from(r).sort()}}function at(e,t){const n=e.trim();if(!n)return{error:{row:t,message:`${t}行目: 演奏時間が空です。`}};if(/\d+\D+\d+/.test(n))return{error:{row:t,message:`${t}行目: 演奏時間「${n}」が曖昧です。数字が複数含まれているため、どの数字を使用すべきか判断できません。数字のみで入力してください（例: 「5」）。`}};const i=n.replace(/\D/g,"");if(!i)return{error:{row:t,message:`${t}行目: 演奏時間「${n}」に数字が含まれていません。`}};const r=parseInt(i,10);return r<=0?{error:{row:t,message:`${t}行目: 演奏時間は1分以上にしてください。`}}:{value:r}}const fe=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],qe=["var(--m1)","var(--m2)","var(--m3)","var(--m4)","var(--m5)","var(--m6)","var(--m7)","var(--m8)","var(--m9)","var(--m10)"];function R(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ee(e){const t=e.split(":");return parseInt(t[0],10)*60+parseInt(t[1],10)}function de(e){const t=Math.floor(e/60)%24,n=e%60;return`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function we(e,t){const n=e.indexOf(t);return n>=0?qe[n%qe.length]:"var(--text-2)"}function Le(e){const t=new Map;for(const n of e)t.set(n.afterIndex,n.duration);return t}const Re=["vocal","leadGuitar","backingGuitar","bass","drums","keyboard"];function rt(e,t,n){const i=ne("emptyIndicator","n/a"),r=ne("entryMode","paste"),s=document.createElement("div");s.className="panel-section open",s.dataset.panel="data",s.innerHTML=`
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-icon data">☰</span>
        <span class="panel-title">バンドデータ</span>
        <span class="panel-badge" id="band-count-badge">${t.bands.length} bands</span>
      </div>
      <span class="panel-chevron">▸</span>
    </div>
    <div class="panel-body">
      <div class="p-tabs">
        <button type="button" class="p-tab ${r==="paste"?"active":""}" data-tab="paste">Paste</button>
        <button type="button" class="p-tab ${r!=="paste"?"active":""}" data-tab="manual">Manual</button>
      </div>

      <!-- Paste tab -->
      <div id="data-tab-paste" class="${r!=="paste"?"hidden":""}">
        <div class="p-row p-inline">
          <label class="p-label" style="margin:0;flex:0 0 auto">空席表記</label>
          <input class="p-input" id="empty-indicator" style="width:55px;text-align:center;font-family:var(--font-mono)" value="${R(i)}" />
          <div style="flex:1"></div>
          <button class="p-btn p-btn-accent p-btn-sm" id="paste-btn">解析</button>
        </div>
        <div class="p-row">
          <textarea class="p-textarea" id="paste-input" rows="3" placeholder="King Gnu&#9;井口&#9;常田&#9;n/a&#9;新井&#9;勢喜&#9;井口&#9;20分"></textarea>
          <div class="p-help">スプレッドシートからコピーするか、タブ区切りで入力（バンド名 / Vo. / L.Gt / B.Gt / Ba. / Dr. / Key. / 時間）<br>メンバー名にスペース不可・時間の数値はすべて「分」として扱います</div>
        </div>
        <div id="paste-feedback"></div>
      </div>

      <!-- Manual tab -->
      <div id="data-tab-manual" class="${r==="paste"?"hidden":""}">
        <div class="p-row">
          <label class="p-label">プレイヤー</label>
          <div class="p-tag-wrap" id="player-tag-wrap">
            <div id="player-chips"></div>
            <input type="text" class="p-tag-input" id="player-tag-input" placeholder="名前を入力 + Enter" />
          </div>
        </div>

        <div class="p-row">
          <label class="p-label">バンド名</label>
          <input type="text" class="p-input" id="band-name-input" placeholder="バンド名" />
        </div>
        <div class="p-row">
          <label class="p-label">パート</label>
          <div class="manual-form-parts" id="manual-parts">
            ${fe.map((b,S)=>`
              <label class="p-label">
                ${b}
                <select class="p-select part-dropdown" id="part-${Re[S]}">
                  <option value="n/a">— 空き —</option>
                </select>
              </label>
            `).join("")}
          </div>
        </div>
        <div class="p-row p-inline">
          <label class="p-label" style="margin:0;flex:0 0 auto">時間(分)</label>
          <input type="number" class="p-input" id="band-time-input" style="width:55px;font-family:var(--font-mono)" min="1" placeholder="5" />
          <div style="flex:1"></div>
          <button class="p-btn p-btn-accent p-btn-sm" id="add-band-btn">追加</button>
        </div>
      </div>

      <!-- Band list -->
      <div class="p-row" style="margin-top:0.6rem">
        <label class="p-label">登録済みバンド</label>
        <div class="band-mini-list" id="band-mini-list"></div>
      </div>

      <!-- Clear -->
      <div style="display:flex;justify-content:flex-end;margin-top:0.3rem" id="clear-area">
        <button class="p-btn p-btn-danger p-btn-sm" id="clear-all-btn">全データ削除</button>
      </div>
    </div>
  `,e.appendChild(s),s.querySelector(".panel-header").addEventListener("click",()=>{s.classList.toggle("open")});const d=s.querySelector("#band-count-badge"),a=s.querySelector("#paste-feedback"),c=s.querySelector("#paste-input"),p=s.querySelector("#empty-indicator"),L=s.querySelector("#paste-btn"),v=s.querySelector("#player-chips"),o=s.querySelector("#player-tag-input"),y=s.querySelector("#band-name-input"),B=s.querySelector("#band-time-input"),P=s.querySelector("#add-band-btn"),k=s.querySelector("#band-mini-list"),A=s.querySelector("#clear-area");function g(){d.textContent=`${t.bands.length} bands`}k.addEventListener("click",b=>{const S=b.target.closest(".band-mini-delete");if(!S)return;const N=parseInt(S.dataset.index,10);t.bands.splice(N,1),W("bands",t.bands),f(),g(),n()}),s.querySelectorAll(".p-tab").forEach(b=>{b.addEventListener("click",()=>{s.querySelectorAll(".p-tab").forEach(N=>N.classList.remove("active")),b.classList.add("active");const S=b.dataset.tab;s.querySelector("#data-tab-paste").classList.toggle("hidden",S!=="paste"),s.querySelector("#data-tab-manual").classList.toggle("hidden",S!=="manual"),W("entryMode",S)})}),p.addEventListener("input",()=>{W("emptyIndicator",p.value.trim()||"n/a")}),c.addEventListener("input",()=>{c.style.height="auto",c.style.height=c.scrollHeight+"px"}),L.addEventListener("click",()=>{const b=c.value.trim();if(!b){a.innerHTML='<div class="p-error">テキストが入力されていません。</div>';return}const S=p.value.trim()||"n/a",N=st(b,S);if(N.errors.length>0){a.innerHTML=N.errors.map(u=>`<div class="p-error">${R(u.message)}</div>`).join("");return}const C=new Set(t.players);for(const u of N.players)C.has(u)||(t.players.push(u),C.add(u));W("players",t.players);const K=new Set(t.bands.map(u=>u.name.toLowerCase())),H=[];let j=0;for(const u of N.bands)K.has(u.name.toLowerCase())?H.push(u.name):(t.bands.push(u),K.add(u.name.toLowerCase()),j++);W("bands",t.bands),c.value="";let Y="";j>0&&(Y+=`<div class="p-success">✓ ${j}バンド登録 · ${N.players.length}人検出</div>`),H.length>0&&(Y+=`<div class="p-error" style="margin-top:0.3rem">重複のためスキップ: ${H.map(R).join("、")}</div>`),!j&&H.length>0&&(Y=`<div class="p-error">全て既に登録済みのバンドです: ${H.map(R).join("、")}</div>`),a.innerHTML=Y,q(),V(),f(),g(),n()});function q(){v.innerHTML=t.players.map(b=>`<span class="p-chip">${R(b)}<button type="button" class="p-chip-delete" data-name="${R(b)}">✕</button></span>`).join("")}v.addEventListener("click",b=>{const S=b.target.closest(".p-chip-delete");S&&(t.players=t.players.filter(N=>N!==S.dataset.name),W("players",t.players),q(),V(),n())}),o.addEventListener("keydown",b=>{if(b.key==="Enter"){b.preventDefault();const S=o.value.trim();S&&!t.players.includes(S)&&(t.players.push(S),W("players",t.players),q(),V()),o.value=""}});function V(){s.querySelectorAll(".part-dropdown").forEach(b=>{const S=b.value;b.innerHTML='<option value="n/a">— 空き —</option>';for(const N of t.players){const C=document.createElement("option");C.value=N,C.textContent=N,N===S&&(C.selected=!0),b.appendChild(C)}})}P.addEventListener("click",()=>{const b=y.value.trim(),S=parseInt(B.value,10);if(!b||!S||S<=0)return;if(t.bands.some(C=>C.name.toLowerCase()===b.toLowerCase())){y.style.borderColor="var(--red)";let C=s.querySelector("#band-dupe-warn");C||(C=document.createElement("div"),C.id="band-dupe-warn",C.className="p-error",y.parentElement.appendChild(C)),C.textContent=`「${b}」は既に登録されています。`,setTimeout(()=>{y.style.borderColor="",C&&C.remove()},3e3);return}const N=Re.map(C=>{const K=s.querySelector(`#part-${C}`);return K?K.value:"n/a"});t.bands.push({name:b,members:N,estimatedTime:S}),W("bands",t.bands),y.value="",B.value="",f(),g(),n()});function f(){if(t.bands.length===0){k.innerHTML='<div style="font-size:0.68rem;color:var(--text-3);padding:0.3rem 0">バンドが登録されていません</div>';return}k.innerHTML=t.bands.map((b,S)=>`
      <div class="band-mini-item">
        <span class="band-mini-name">${R(b.name)}</span>
        <span class="band-mini-time">${b.estimatedTime}分</span>
        <button type="button" class="band-mini-delete" data-index="${S}">✕</button>
      </div>
    `).join("")}let I=!1;A.querySelector("#clear-all-btn").addEventListener("click",b=>{if(b.stopPropagation(),I)return;I=!0;const S=A.querySelector("#clear-all-btn");S.classList.add("hidden");const N=document.createElement("div");N.className="clear-confirm-bar",N.innerHTML=`
      <span class="clear-confirm-text">全て削除しますか？</span>
      <button type="button" class="p-btn p-btn-danger p-btn-sm" id="confirm-yes">削除</button>
      <button type="button" class="p-btn p-btn-sm" id="confirm-no">取消</button>
    `,A.appendChild(N),N.querySelector("#confirm-yes").addEventListener("click",C=>{C.stopPropagation(),t.players=[],t.bands=[],t.rules=[],t.breaks=[],t.results=null,t.schedule=null,t.selectedResultIndex=0,W("players",[]),W("bands",[]),W("rules",[]),W("breaks",[]),q(),V(),f(),g(),N.remove(),S.classList.remove("hidden"),I=!1,n()}),N.querySelector("#confirm-no").addEventListener("click",C=>{C.stopPropagation(),N.remove(),S.classList.remove("hidden"),I=!1})}),q(),V(),f()}const xe=0,pe=1,me=2,it=3,ot=5,ze=[0,1,1,1,0,1];function ce(e,t,n){return e===t||n&&e!=="n/a"&&t==="n/a"?0:1}function ke(e,t,n,i,r){const s=r||ze;let d=0;if(n)for(let a=0;a<=5;a++)d+=ce(e[a],t[a],i)*s[a];else{d+=ce(e[xe],t[xe],i)*s[xe];const a=Math.max(s[pe],s[me]),c=ce(e[pe],t[pe],i)*a+ce(e[me],t[me],i)*a,p=ce(e[pe],t[me],i)*a+ce(e[me],t[pe],i)*a;d+=Math.min(c,p);for(let L=it;L<=ot;L++)d+=ce(e[L],t[L],i)*s[L]}return d}function lt(e){return e=e-(e>>1&1431655765),e=(e&858993459)+(e>>2&858993459),(e+(e>>4)&252645135)*16843009>>24}function Je(e,t={},n=3){const{distinguishGuitar:i=!0,freeLeave:r=!1,costWeights:s,constraints:d={}}=t,{fixedLast:a=null,rules:c=[],fixedPositions:p=[],bandOrdering:L=[],playerAppearance:v=[],consecutiveLimit:o=null,bandAdjacency:y=[],appearanceSpan:B=[]}=d,P=e.length;if(B.length>0){let G=function(T,w){if(!($>=O)){if(T===m.length){$++;const D=[];for(let J=0;J<l.length;J++){const se=w[J],Z=se+l[J].spanLimit-1;D.push({player:l[J].player,position:se,mode:"after"}),D.push({player:l[J].player,position:Z,mode:"before"})}try{const J=Je(e,{distinguishGuitar:i,freeLeave:r,costWeights:s,constraints:{fixedLast:a,rules:c,fixedPositions:p,bandOrdering:L,playerAppearance:[...v,...D],consecutiveLimit:o,bandAdjacency:y,appearanceSpan:[]}},n);for(const se of J){const Z=se.path.join(",");z.has(Z)||(z.add(Z),h.push(se))}}catch{}return}for(const D of m[T])if(w.push(D),G(T+1,w),w.pop(),$>=O)return}};var le=G;const l=B.map(T=>{let w=0;for(const D of e)D.members.some(J=>J===T.player)&&w++;return{player:T.player,spanLimit:T.spanLimit,bandCount:w}}),m=l.map(T=>{const w=[];for(let D=1;D<=P-T.spanLimit+1;D++)w.push(D);return w}),h=[],z=new Set;let $=0;const O=200;return G(0,[]),h.sort((T,w)=>T.cost-w.cost),h.slice(0,n)}const k=[];for(let l=0;l<P;l++)l!==a&&k.push(l);const A=k.length;if(A>20)throw new Error(`Too many bands for bitmask DP (${A}). Max supported is 20.`);const g=new Map;k.forEach((l,m)=>g.set(l,m));const q=c.filter(l=>g.has(l.bandIndex)).map(l=>({localIndex:g.get(l.bandIndex),maxPosition:l.maxPosition||null,minPosition:l.minPosition||null,requiredBefore:(l.requiredBefore||[]).filter(m=>g.has(m)).map(m=>g.get(m))})),V=p.filter(l=>g.has(l.bandIndex)).map(l=>({localIndex:g.get(l.bandIndex),position:l.exactPosition})),f=L.filter(l=>g.has(l.before)&&g.has(l.after)).map(l=>({before:g.get(l.before),after:g.get(l.after)})),I=[];for(const l of v){const m=[];for(let h=0;h<P;h++)h!==a&&e[h].members.some(z=>z===l.player)&&g.has(h)&&m.push(g.get(h));m.length>0&&I.push({localBands:m,position:l.position,mode:l.mode})}const b=y.filter(l=>g.has(l.before)&&g.has(l.after)).map(l=>({before:g.get(l.before),after:g.get(l.after)}));let S=null;if(o===1){S=Array.from({length:A},()=>new Uint8Array(A));for(let l=0;l<A;l++)for(let m=l+1;m<A;m++){const h=e[k[l]].members,z=e[k[m]].members;let $=!1;for(let O=0;O<h.length;O++){if(h[O]!=="n/a"){for(let G=0;G<z.length;G++)if(h[O]===z[G]){$=!0;break}}if($)break}$&&(S[l][m]=1,S[m][l]=1)}}let N=null;o!==null&&o>=2&&(N=k.map(l=>new Set(e[l].members.filter(m=>m!=="n/a"))));const C=Array.from({length:A},()=>new Int32Array(A));for(let l=0;l<A;l++)for(let m=0;m<A;m++)l!==m&&(C[l][m]=ke(e[k[l]].members,e[k[m]].members,i,r,s));let K=null;if(a!==null){K=new Int32Array(A);for(let l=0;l<A;l++)K[l]=ke(e[k[l]].members,e[a].members,i,r,s)}const H=2147483647,j=1<<A,Y=j-1,u=new Int32Array(A*j).fill(H),F=new Int32Array(A*j).fill(-1);function E(l){for(const m of q)if(m.localIndex===l&&(m.requiredBefore.length>0||m.minPosition&&1<m.minPosition))return!1;for(const m of V)if(m.localIndex===l&&m.position!==1||m.localIndex!==l&&m.position===1)return!1;for(const m of f)if(m.after===l)return!1;for(const m of I)if(m.mode==="after"&&m.localBands.includes(l)&&1<m.position)return!1;for(const m of b)if(m.after===l)return!1;return!0}function _(l,m,h,z){for(const $ of q)if($.localIndex===l){if($.maxPosition&&h>$.maxPosition||$.minPosition&&h<$.minPosition)return!1;if($.requiredBefore.length>0){let O=!1;for(const G of $.requiredBefore)if(m&1<<G){O=!0;break}if(!O)return!1}}for(const $ of V)if($.localIndex===l&&$.position!==h||$.localIndex!==l&&$.position===h)return!1;for(const $ of f)if($.after===l&&!(m&1<<$.before))return!1;for(const $ of I)if($.localBands.includes(l)&&($.mode==="before"&&h>$.position||$.mode==="after"&&h<$.position))return!1;if(S&&z>=0&&S[z][l])return!1;if(N&&o>=2){const $=[l];let O=z,G=m;for(let T=0;T<=o-1&&($.push(O),$.length!==o+1);T++){const w=F[O*j+G];if(w===-1)break;G^=1<<O,O=w}if($.length===o+1){const T=N[$[0]];for(const w of T){let D=!0;for(let J=1;J<$.length;J++)if(!N[$[J]].has(w)){D=!1;break}if(D)return!1}}}for(const $ of b)if($.after===l&&z!==$.before||$.before===z&&l!==$.after)return!1;return!0}for(let l=0;l<A;l++)E(l)&&(u[l*j+(1<<l)]=0);for(let l=1;l<j;l++)for(let m=0;m<A;m++){const h=m*j+l;if(u[h]===H||!(l&1<<m))continue;const z=u[h],$=lt(l)+1;for(let O=0;O<A;O++){if(l&1<<O||!_(O,l,$,m))continue;const G=l|1<<O,T=z+C[m][O],w=O*j+G;T<u[w]&&(u[w]=T,F[w]=m)}}const U=[];for(let l=0;l<A;l++){const m=l*j+Y;if(u[m]===H)continue;const h=K!==null?u[m]+K[l]:u[m];U.push({last:l,cost:h})}if(U.length===0)return[];U.sort((l,m)=>l.cost-m.cost);const Q=[],ae=new Set;for(const l of U){if(Q.length>=n)break;const m=[];let h=Y,z=l.last;for(;z!==-1;){m.push(z);const G=F[z*j+h];h^=1<<z,z=G}m.reverse();const $=m.map(G=>k[G]);a!==null&&$.push(a);const O=$.join(",");ae.has(O)||(ae.add(O),!(o!==null&&o>=2&&!ct($,e,o))&&Q.push({path:$,cost:l.cost}))}return Q}function ct(e,t,n){const i=new Map;for(let r=0;r<e.length;r++){const s=new Set(t[e[r]].members.filter(a=>a!=="n/a")),d=new Map;for(const a of s){const p=(i.get(a)||0)+1;if(p>n)return!1;d.set(a,p)}i.clear();for(const[a,c]of d)i.set(a,c)}return!0}function dt(e,t,n,i,r){return t.map((s,d)=>{const a=e[s],c=d===0?null:ke(e[t[d-1]].members,a.members,n,i,r);return{bandIndex:s,name:a.name,members:a.members,cost:c}})}const ut=ze,M={BAND_POSITION:"bandPosition",BAND_ORDER:"bandOrder",PLAYER_APPEARANCE:"playerAppearance",CONSECUTIVE_LIMIT:"consecutiveLimit",BAND_ADJACENCY:"bandAdjacency",APPEARANCE_SPAN:"appearanceSpan"};function pt(e,t,n,i){const r=document.createElement("div");r.className="panel-section open",r.innerHTML=`
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-icon cost">⚖</span>
        <span class="panel-title">転換コスト</span>
      </div>
      <span class="panel-chevron">▸</span>
    </div>
    <div class="panel-body">
      <div class="p-help" style="margin-bottom:0.5rem">パートごとのメンバー交代コスト（0〜3）</div>
      <div class="cost-mini-grid" id="cost-grid">
        ${fe.map((f,I)=>`
          <div class="cost-cell">
            <span class="cost-cell-label">${f}</span>
            <input type="number" min="0" max="3" value="${t.costWeights[I]}" data-idx="${I}" class="cost-weight-input" />
          </div>
        `).join("")}
      </div>
      <div style="margin-top:0.6rem">
        <label class="p-toggle-wrap">
          <input type="checkbox" class="p-toggle-input" id="distinguish-guitar" ${t.distinguishGuitar?"checked":""} />
          <span class="p-toggle-track"></span>
          <span class="p-toggle-text">リードとバッキングを区別する</span>
        </label>
        <div class="p-help" style="margin-top:0.3rem">OFFにすると、同じギタリストがL.Gt⇔B.Gtを入れ替えても転換コスト0になります</div>
      </div>
    </div>
  `,r.querySelector(".panel-header").addEventListener("click",()=>{r.classList.toggle("open")}),r.querySelectorAll(".cost-weight-input").forEach(f=>{const I=()=>{let b=parseInt(f.value,10);const S=parseInt(f.dataset.idx,10);isNaN(b)&&(b=ut[S]),b=Math.max(0,Math.min(3,b)),f.value=b,t.costWeights[S]=b,W("costWeights",t.costWeights),n()};f.addEventListener("change",I),f.addEventListener("blur",I),f.addEventListener("focus",()=>f.select())}),r.querySelector("#distinguish-guitar").addEventListener("change",f=>{t.distinguishGuitar=f.target.checked,W("distinguishGuitar",t.distinguishGuitar),n()}),e.appendChild(r);const s=document.createElement("div");s.className="panel-section",s.innerHTML=`
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-icon rules">⚑</span>
        <span class="panel-title">ルール</span>
        <span class="panel-badge" id="rules-count-badge">${t.rules.length} rules</span>
      </div>
      <span class="panel-chevron">▸</span>
    </div>
    <div class="panel-body">
      <div class="p-row">
        <label class="p-label">ルール種類</label>
        <select class="p-select" id="rule-type-select">
          <option value="${M.BAND_POSITION}">バンドの配置指定</option>
          <option value="${M.BAND_ORDER}">バンドの順序指定</option>
          <option value="${M.PLAYER_APPEARANCE}">メンバーの出演位置</option>
          <option value="${M.CONSECUTIVE_LIMIT}">連続出演制限</option>
          <option value="${M.BAND_ADJACENCY}">バンドの隣接指定</option>
          <option value="${M.APPEARANCE_SPAN}">出演スパン制限</option>
        </select>
      </div>
      <div id="rule-config"></div>
      <div class="p-row p-inline" style="margin-top:0.3rem">
        <button class="p-btn p-btn-accent p-btn-sm" id="add-rule-btn">ルールを追加</button>
      </div>
      <div id="rule-error"></div>
      <div id="rules-list" style="margin-top:0.5rem"></div>
      <div id="rules-validation" style="margin-top:0.4rem"></div>
    </div>
  `,s.querySelector(".panel-header").addEventListener("click",()=>{s.classList.toggle("open")});const d=s.querySelector("#rule-type-select"),a=s.querySelector("#rule-config"),c=s.querySelector("#add-rule-btn"),p=s.querySelector("#rule-error"),L=s.querySelector("#rules-list"),v=s.querySelector("#rules-count-badge");s.querySelector("#rules-validation");let o=-1;function y(){v.textContent=`${t.rules.length} rules`}function B(f){if(f==="edit"){c.textContent="保存",c.dataset.mode="edit";let I=s.querySelector("#cancel-edit-btn");I||(I=document.createElement("button"),I.id="cancel-edit-btn",I.className="p-btn p-btn-sm",I.textContent="キャンセル",I.addEventListener("click",()=>{P()}),c.parentElement.appendChild(I)),I.classList.remove("hidden")}else{c.textContent="ルールを追加",c.dataset.mode="add";const I=s.querySelector("#cancel-edit-btn");I&&I.classList.add("hidden")}}function P(){o=-1,B("add"),p.innerHTML="",k(),A()}function k(){mt(a,d.value,t.bands,t.players),Et(a,t.bands.length)}d.addEventListener("change",()=>{o>=0&&P(),k()}),k(),document.addEventListener("themis:dataChanged",()=>{k(),g()});function A(){vt(L,t.rules,o,{onDelete(f){o===f?P():o>f&&o--,t.rules.splice(f,1),W("rules",t.rules),y(),A(),g(),n()},onEdit(f){o=f;const I=t.rules[f];d.value=I.type,k(),ft(a,I),B("edit"),A()}}),y()}c.addEventListener("click",()=>{p.innerHTML="";const f=bt(a,d.value,t.bands,t.players,t.rules);if(f&&f.error){p.innerHTML=`<div class="rule-error-msg">${R(f.error)}</div>`;return}f&&(o>=0?(t.rules[o]=f,o=-1,B("add")):t.rules.push(f),W("rules",t.rules),k(),A(),g(),n())});function g(){const f=gt(t.rules,t.bands);document.dispatchEvent(new CustomEvent("themis:rulesValidated",{detail:{warnings:f}}))}A(),B("add"),g(),e.appendChild(s);const q=document.createElement("div");q.className="panel-section",q.innerHTML=`
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-icon time">◷</span>
        <span class="panel-title">タイミング</span>
      </div>
      <span class="panel-chevron">▸</span>
    </div>
    <div class="panel-body">
      <div class="p-row">
        <label class="p-label">開始時刻</label>
        <input class="p-input" type="time" id="timing-start" value="${t.timing.startTime}" style="font-family:var(--font-mono)" />
      </div>
      <div class="p-row">
        <label class="p-label">転換時間（分）</label>
        <input class="p-input" type="number" id="timing-transition" value="${t.timing.transitionTime}" min="0" style="width:70px;font-family:var(--font-mono)" />
      </div>
      <div class="p-row">
        <label class="p-label">最小時間単位（分）</label>
        <input class="p-input" type="number" id="timing-unit" value="${t.timing.minUnit}" min="1" style="width:70px;font-family:var(--font-mono)" />
        <div class="p-help">全ての時刻をこの分数の倍数に丸めます<br>（例: 5 → 12:03は12:05に）</div>
      </div>
    </div>
  `,q.querySelector(".panel-header").addEventListener("click",()=>{q.classList.toggle("open")});function V(){const f=parseInt(q.querySelector("#timing-unit").value,10)||5,I=parseInt(q.querySelector("#timing-transition").value,10)||5,b=q.querySelector("#timing-start").value||"12:00";t.timing={minUnit:f,transitionTime:I,startTime:b},W("timing",t.timing)}["#timing-start","#timing-transition","#timing-unit"].forEach(f=>{q.querySelector(f).addEventListener("change",()=>{V(),document.dispatchEvent(new CustomEvent("themis:timingChanged"))})}),e.appendChild(q)}function mt(e,t,n,i){const r=n.map((d,a)=>`<option value="${a}">${R(d.name)}</option>`).join(""),s=i.map(d=>`<option value="${R(d)}">${R(d)}</option>`).join("");switch(t){case M.BAND_POSITION:e.innerHTML=`
        <div class="rule-builder-row">
          <select id="rc-band" class="p-select">${r}</select>
          <span>は</span>
          <input type="number" id="rc-position" class="p-input p-input-narrow" min="1" max="${n.length}" value="1" />
          <span>番目</span>
          <select id="rc-pos-mode" class="p-select">
            <option value="exactly">ちょうど</option>
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;break;case M.BAND_ORDER:e.innerHTML=`
        <div class="rule-builder-row">
          <select id="rc-band-a" class="p-select">${r}</select>
          <span>は</span>
          <select id="rc-band-b" class="p-select">${r}</select>
          <span>の</span>
          <select id="rc-order-dir" class="p-select">
            <option value="before">前</option>
            <option value="after">後</option>
          </select>
        </div>
      `;break;case M.PLAYER_APPEARANCE:e.innerHTML=`
        <div class="rule-builder-row">
          <select id="rc-player" class="p-select">${s}</select>
          <span>の出演は全て</span>
          <input type="number" id="rc-appear-pos" class="p-input p-input-narrow" min="1" max="${n.length}" value="1" />
          <span>番目</span>
          <select id="rc-appear-mode" class="p-select">
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;break;case M.CONSECUTIVE_LIMIT:e.innerHTML=`
        <div class="rule-builder-row">
          <span>同一メンバー連続最大</span>
          <input type="number" id="rc-consec-limit" class="p-input p-input-narrow" min="1" max="${n.length}" value="2" />
          <span>バンド</span>
        </div>
        <div id="consec-warning" class="rule-warning" style="display:none;">
          1に設定すると、解が見つからない場合があります。
        </div>
      `;{const d=e.querySelector("#rc-consec-limit"),a=e.querySelector("#consec-warning");d&&a&&d.addEventListener("input",()=>{a.style.display=parseInt(d.value,10)===1?"":"none"})}break;case M.BAND_ADJACENCY:e.innerHTML=`
        <div class="rule-builder-row">
          <select id="rc-adj-band-a" class="p-select">${r}</select>
          <span>を</span>
          <select id="rc-adj-band-b" class="p-select">${r}</select>
          <span>の</span>
          <select id="rc-adj-dir" class="p-select">
            <option value="rightBefore">直前</option>
            <option value="rightAfter">直後</option>
          </select>
          <span>に</span>
        </div>
      `;break;case M.APPEARANCE_SPAN:e.innerHTML=`
        <div class="rule-builder-row">
          <select id="rc-span-player" class="p-select">${s}</select>
          <span>の最初の出演から最後の出演までは</span>
          <input type="number" id="rc-span-limit" class="p-input p-input-narrow" min="1" max="${n.length}" value="3" />
          <span>バンド以内</span>
        </div>
      `;break}}function ft(e,t){switch(t.type){case M.BAND_POSITION:{const n=e.querySelector("#rc-band"),i=e.querySelector("#rc-pos-mode"),r=e.querySelector("#rc-position");n&&(n.value=String(t.bandIndex)),i&&(i.value=t.mode),r&&(r.value=t.position);break}case M.BAND_ORDER:{const n=e.querySelector("#rc-band-a"),i=e.querySelector("#rc-band-b"),r=e.querySelector("#rc-order-dir");n&&(n.value=String(t.before)),i&&(i.value=String(t.after)),r&&(r.value="before");break}case M.PLAYER_APPEARANCE:{const n=e.querySelector("#rc-player"),i=e.querySelector("#rc-appear-mode"),r=e.querySelector("#rc-appear-pos");n&&(n.value=t.player),i&&(i.value=t.mode),r&&(r.value=t.position);break}case M.CONSECUTIVE_LIMIT:{const n=e.querySelector("#rc-consec-limit");n&&(n.value=t.limit);break}case M.BAND_ADJACENCY:{const n=e.querySelector("#rc-adj-band-a"),i=e.querySelector("#rc-adj-band-b"),r=e.querySelector("#rc-adj-dir");n&&(n.value=String(t.bandA)),i&&(i.value=String(t.bandB)),r&&(r.value=t.direction);break}case M.APPEARANCE_SPAN:{const n=e.querySelector("#rc-span-player"),i=e.querySelector("#rc-span-limit");n&&(n.value=t.player),i&&(i.value=t.spanLimit);break}}}function bt(e,t,n,i,r,s){const d=n.length;switch(t){case M.BAND_POSITION:{const a=parseInt(e.querySelector("#rc-band")?.value,10),c=e.querySelector("#rc-pos-mode")?.value,p=parseInt(e.querySelector("#rc-position")?.value,10);return isNaN(a)||isNaN(p)||p<1?null:p>d?{error:`${p}番目は存在しません（バンドは${d}つ）。`}:{type:M.BAND_POSITION,bandIndex:a,bandName:n[a]?.name||"",mode:c,position:p}}case M.BAND_ORDER:{const a=parseInt(e.querySelector("#rc-band-a")?.value,10),c=parseInt(e.querySelector("#rc-band-b")?.value,10),p=e.querySelector("#rc-order-dir")?.value;if(isNaN(a)||isNaN(c))return null;if(a===c)return{error:"同じバンドを指定することはできません。"};const L=p==="before"?a:c,v=p==="before"?c:a;return{type:M.BAND_ORDER,before:L,after:v,beforeName:n[L]?.name||"",afterName:n[v]?.name||""}}case M.PLAYER_APPEARANCE:{const a=e.querySelector("#rc-player")?.value,c=e.querySelector("#rc-appear-mode")?.value,p=parseInt(e.querySelector("#rc-appear-pos")?.value,10);return!a||isNaN(p)||p<1?null:{type:M.PLAYER_APPEARANCE,player:a,mode:c,position:p}}case M.CONSECUTIVE_LIMIT:{const a=parseInt(e.querySelector("#rc-consec-limit")?.value,10);return isNaN(a)||a<1?null:{type:M.CONSECUTIVE_LIMIT,limit:a}}case M.BAND_ADJACENCY:{const a=parseInt(e.querySelector("#rc-adj-band-a")?.value,10),c=parseInt(e.querySelector("#rc-adj-band-b")?.value,10),p=e.querySelector("#rc-adj-dir")?.value;return isNaN(a)||isNaN(c)?null:a===c?{error:"同じバンドを指定することはできません。"}:{type:M.BAND_ADJACENCY,bandA:a,bandB:c,bandAName:n[a]?.name||"",bandBName:n[c]?.name||"",direction:p}}case M.APPEARANCE_SPAN:{const a=e.querySelector("#rc-span-player")?.value,c=parseInt(e.querySelector("#rc-span-limit")?.value,10);return!a||isNaN(c)||c<1?null:{type:M.APPEARANCE_SPAN,player:a,spanLimit:c}}}return null}function vt(e,t,n,i){if(t.length===0){e.innerHTML='<div style="font-size:0.68rem;color:var(--text-3)">ルールなし — デフォルトで最適化</div>';return}e.innerHTML=t.map((r,s)=>{const d=s===n;return`
      <div class="rule-chip ${d?"rule-editing":""}" data-index="${s}">
        <span class="rule-chip-text">${ht(r)}</span>
        <span class="rule-chip-actions">
          ${d?'<span class="rule-editing-label">編集中</span>':`<button type="button" class="rule-edit-btn" data-index="${s}" title="編集">✎</button>`}
          <button type="button" class="x" data-index="${s}" title="削除">✕</button>
        </span>
      </div>
    `}).join(""),e.querySelectorAll(".x").forEach(r=>{r.addEventListener("click",s=>{s.stopPropagation(),i.onDelete(parseInt(r.dataset.index,10))})}),e.querySelectorAll(".rule-edit-btn").forEach(r=>{r.addEventListener("click",s=>{s.stopPropagation(),i.onEdit(parseInt(r.dataset.index,10))})})}function ht(e){switch(e.type){case M.BAND_POSITION:return e.mode==="exactly"?`${R(e.bandName)} → ${e.position}番目`:e.mode==="after"?`${R(e.bandName)} → ${e.position}番目以降`:`${R(e.bandName)} → ${e.position}番目以前`;case M.BAND_ORDER:return`${R(e.beforeName)} → ${R(e.afterName)}の前`;case M.PLAYER_APPEARANCE:return`${R(e.player)} → ${e.position}番目${e.mode==="before"?"以前":"以降"}`;case M.CONSECUTIVE_LIMIT:return`連続制限: 最大${e.limit}バンド`;case M.BAND_ADJACENCY:return`${R(e.bandAName)} → ${R(e.bandBName)}の${e.direction==="rightBefore"?"直前":"直後"}`;case M.APPEARANCE_SPAN:return`${R(e.player)} → 出演スパン${e.spanLimit}バンド以内`;default:return"不明なルール"}}function gt(e,t){const n=[],i=t.length;if(i===0)return n;i>20&&n.push(`バンドが${i}つ登録されていますが、最適化できるのは最大20バンドです。`);const r=new Map,s=new Map;for(const a of e)if(!(a.type!==M.BAND_POSITION||a.mode!=="exactly")){if(r.has(a.bandIndex)){const c=r.get(a.bandIndex);c!==a.position&&n.push(`「${a.bandName}」が${c}番目と${a.position}番目の両方に固定されています。`)}r.set(a.bandIndex,a.position),s.has(a.position)||s.set(a.position,new Map),s.get(a.position).set(a.bandIndex,a.bandName)}for(const[a,c]of s)c.size>1&&n.push(`${a}番目に複数のバンド（${[...c.values()].join("、")}）が固定されています。`);const d=e.filter(a=>a.type===M.BAND_ORDER);for(const a of d)for(const c of d)a.before===c.after&&a.after===c.before&&n.push(`「${t[a.before]?.name}」と「${t[a.after]?.name}」が互いに相手の前に配置するよう指定されています（矛盾）。`);return n}function yt(e){const t={fixedLast:null,rules:[],fixedPositions:[],bandOrdering:[],playerAppearance:[],consecutiveLimit:null,bandAdjacency:[],appearanceSpan:[]};for(const n of e)switch(n.type){case M.BAND_POSITION:n.mode==="exactly"?t.fixedPositions.push({bandIndex:n.bandIndex,exactPosition:n.position}):n.mode==="after"?t.rules.push({bandIndex:n.bandIndex,minPosition:n.position,requiredBefore:[]}):t.rules.push({bandIndex:n.bandIndex,maxPosition:n.position,requiredBefore:[]});break;case M.BAND_ORDER:t.bandOrdering.push({before:n.before,after:n.after});break;case M.PLAYER_APPEARANCE:t.playerAppearance.push({player:n.player,position:n.position,mode:n.mode});break;case M.CONSECUTIVE_LIMIT:(t.consecutiveLimit===null||n.limit<t.consecutiveLimit)&&(t.consecutiveLimit=n.limit);break;case M.BAND_ADJACENCY:{const i=n.direction==="rightBefore"?n.bandA:n.bandB,r=n.direction==="rightBefore"?n.bandB:n.bandA;t.bandAdjacency.push({before:i,after:r});break}case M.APPEARANCE_SPAN:t.appearanceSpan.push({player:n.player,spanLimit:n.spanLimit});break}return t}function Et(e,t){e.querySelectorAll('input[type="number"]').forEach(i=>{const r=()=>{let s=parseInt(i.value,10);(isNaN(s)||s<1)&&(s=1),s>t&&t>0&&(s=t),i.value=s};i.addEventListener("blur",r),i.addEventListener("change",r)})}function Lt(e,t){if(!t.results||t.results.length===0){e.innerHTML="";return}e.innerHTML=`
    <span class="result-label">Result:</span>
    ${t.results.map((n,i)=>`
      <button type="button" class="result-pill ${i===t.selectedResultIndex?"active":""}" data-idx="${i}">
        #${i+1} cost:${n.cost}
      </button>
    `).join("")}
  `,e.querySelectorAll(".result-pill").forEach(n=>{n.addEventListener("click",()=>{const i=parseInt(n.dataset.idx,10);document.dispatchEvent(new CustomEvent("themis:selectResult",{detail:{index:i}}))})})}function $t(e,t,n,i,r=!1){const s=t.schedule;if(!s||s.length===0){const v=t.rules?t.rules.length:0;e.innerHTML=`
      <div class="error-box">
        <div style="font-weight:600;margin-bottom:0.4rem">解が見つかりません</div>
        <div>現在のルール（${v}件）の組み合わせを満たすタイムテーブルが存在しません。</div>
        <div style="margin-top:0.5rem;font-size:0.78rem;color:var(--text-1)">
          左パネルの「ルール」を開き、条件を緩和するか一部を削除してください。<br>
          特に「連続出演制限」「出演スパン制限」「隣接指定」は制約が強くなりやすいルールです。
        </div>
      </div>`;return}const d=t.bands,a=Le(t.breaks),c=Tt(s,t.breaks,t.timing),p=t.timing.minUnit||5;let L="";c.forEach((v,o)=>{const y=d[v.bandIndex];if(o>0&&d[c[o-1].bandIndex],o>0){const P=v.cost||0,k=P<=1?"cost-low":P<=2?"cost-med":"cost-high";L+=`
        <div class="transition-indicator">
          <div class="transition-line"></div>
          <span class="transition-cost ${k}">転換 ${P}</span>
        </div>
      `}if(o>0){const P=a.get(o-1);P!==void 0&&(L+=`
          <div class="break-card">
            <span class="break-label">休憩</span>
            <span class="break-time">${P}分</span>
            <button type="button" class="break-remove-btn" data-after="${o-1}">✕</button>
          </div>
        `)}const B=y.members.map((P,k)=>{if(P==="n/a")return"";const A=n(P);return`<span class="member-dot" style="color:${A};background:${A}15">${R(P)}<span class="part-label">${fe[k]}</span></span>`}).filter(Boolean).join("");L+=`
      <div class="band-card" style="${r?"":`animation: fadeSlide 0.25s ease-out ${o*.04}s both`}">
        <div class="band-card-inner">
          <div class="band-order">${o+1}</div>
          <div class="band-main">
            <div class="band-name">${R(v.name)}</div>
            <div class="band-members">${B}</div>
          </div>
          <div class="band-time-col">
            <span class="band-time">${v.startTime}〜${v.endTime}</span>
            <span class="band-duration">${v.perfTime}min</span>
          </div>
        </div>
      </div>
    `,o<c.length-1&&!a.has(o)&&(L+=`
        <div class="add-break-zone">
          <button type="button" class="add-break-btn" data-after="${o}">+ 休憩を挿入</button>
        </div>
      `)}),e.innerHTML=L,e.querySelectorAll(".break-remove-btn").forEach(v=>{v.addEventListener("click",()=>{const o=parseInt(v.dataset.after,10);t.breaks=t.breaks.filter(y=>y.afterIndex!==o),W("breaks",t.breaks),i(!0)})}),e.querySelectorAll(".add-break-btn").forEach(v=>{v.addEventListener("click",()=>{const o=parseInt(v.dataset.after,10);Ye(v,o,p,t,i)})})}function Ye(e,t,n,i,r){const s=e.parentElement;s.style.opacity="1",s.innerHTML=`
    <div class="break-input-inline">
      <span class="p-help">休憩（${n}分単位）</span>
      <input type="number" class="p-input" min="${n}" step="${n}" value="${n}" style="width:55px;text-align:center;font-family:var(--font-mono);font-size:0.75rem" />
      <button type="button" class="p-btn p-btn-accent p-btn-sm">OK</button>
      <button type="button" class="p-btn p-btn-sm cancel-break">✕</button>
    </div>
  `;const d=s.querySelector("input"),a=s.querySelector(".p-btn-accent"),c=s.querySelector(".cancel-break");d.focus(),a.addEventListener("click",()=>{const p=parseInt(d.value,10);if(!p||p<n||p%n!==0){d.style.borderColor="var(--red)";return}i.breaks.push({afterIndex:t,duration:p}),i.breaks.sort((L,v)=>L.afterIndex-v.afterIndex),W("breaks",i.breaks),r(!0)}),c.addEventListener("click",()=>{s.style.opacity="",s.innerHTML=`<button type="button" class="add-break-btn" data-after="${t}">+ 休憩を挿入</button>`,s.querySelector(".add-break-btn").addEventListener("click",()=>{Ye(s.querySelector(".add-break-btn"),t,n,i,r)})}),d.addEventListener("keydown",p=>{p.key==="Enter"&&a.click(),p.key==="Escape"&&c.click()})}function xt(e,t,n,i,r){const s=[];let d=Ee(r);for(let a=0;a<e.length;a++){const c=e[a],L=t[c.bandIndex].estimatedTime,v=d,o=v+L+i,y=Math.ceil(o/n)*n;s.push({name:c.name,bandIndex:c.bandIndex,cost:c.cost,startTime:de(v),endTime:de(y),startMinutes:v,endMinutes:y,perfTime:L}),d=y}return s}function Tt(e,t,n){const i=n.minUnit||5,r=n.transitionTime||5;let s=Ee(n.startTime||"12:00");const d=new Map;for(const c of t)d.set(c.afterIndex,c.duration);const a=[];for(let c=0;c<e.length;c++){const p=e[c],L=s,v=L+p.perfTime+r,o=Math.ceil(v/i)*i;a.push({...p,startTime:de(L),endTime:de(o),startMinutes:L,endMinutes:o}),s=o;const y=d.get(c);y!==void 0&&(s+=y)}return a}function Fe(e,t,n){const i=t.bands,r=t.schedule,s=t.results;if(!s||!r||r.length===0){e.innerHTML=`
      <div class="right-placeholder">
        最適化を実行すると<br>統計情報が表示されます
      </div>
    `;return}const d=s[t.selectedResultIndex],a=d?d.cost:0,c=Le(t.breaks),p=t.timing,L=r[0].startTime;let v=r[r.length-1].endMinutes,o=0;for(const E of t.breaks)o+=E.duration;v=r[0].startMinutes;for(let E=0;E<r.length;E++){const _=r[E].perfTime,U=p.transitionTime||5,Q=p.minUnit||5,ae=v+_+U;v=Math.ceil(ae/Q)*Q,c.has(E)&&(v+=c.get(E))}const y=de(v),B=v-Ee(L),P=Math.floor(B/60),k=B%60,A=P>0?`${P}:${String(k).padStart(2,"0")}`:`${k}`,g=r.length-1,q=g>0?(a/g).toFixed(1):"0",V=t.players,f=r.map(E=>E.bandIndex),I={};V.forEach(E=>{I[E]=0});for(const E of f){const _=i[E];if(_)for(const U of _.members)U!=="n/a"&&I[U]!==void 0&&I[U]++}const b=[...V].filter(E=>I[E]>0).sort((E,_)=>I[_]-I[E]),S=b.slice(0,12).map(E=>{const _=we(V,E),U=f.map(Q=>{const ae=i[Q];return`<div class="member-pip" style="background:${ae&&ae.members.includes(E)?_:"var(--bg-3)"}"></div>`}).join("");return`
      <div class="member-row" data-member="${R(E)}">
        <span class="member-name" style="color:${_}">${R(E)}</span>
        <div class="member-pips">${U}</div>
        <span class="member-count">${I[E]}×</span>
      </div>
    `}).join(""),N=At(f,i,V);e.innerHTML=`
    <div class="stat-block">
      <div class="stat-label">total cost</div>
      <div class="stat-value">${a}<span class="unit">pts</span></div>
      <div class="stat-sub">#${t.selectedResultIndex+1} of ${s.length} results</div>
    </div>

    <div class="stat-block">
      <div class="stat-label">duration</div>
      <div class="stat-value">${A}<span class="unit">${P>0?"hrs":"min"}</span></div>
      <div class="stat-sub">${L} → ${y}${o>0?` (休憩${o}分含む)`:""}</div>
    </div>

    <div class="stat-block">
      <div class="stat-label">transitions</div>
      <div class="stat-value">${g}</div>
      <div class="stat-sub">avg ${q} cost / transition</div>
    </div>

    <div class="member-section">
      <div class="member-section-title">
        出演メンバー
        <span style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-3)">${b.length} players</span>
      </div>
      ${S}
    </div>

    <div class="arc-section" style="position:relative">
      <div class="arc-title">Member Flow <span style="font-size:0.55rem;color:var(--text-3);font-weight:400;margin-left:0.3rem">hover to explore</span></div>
      <svg class="arc-svg" id="arc-svg" viewBox="0 0 240 130">${N}</svg>
      <div class="arc-tooltip" id="arc-tooltip"></div>
    </div>

    <div class="export-section">
      <button type="button" class="export-btn" id="export-img-btn">画像として保存</button>
      <div class="export-hint">タイムテーブルをPNG画像でダウンロード</div>
      <button type="button" class="export-btn" id="export-btn" style="margin-top:0.5rem;background:var(--bg-3);color:var(--text-1);border:1px solid var(--border)">クリップボードにコピー</button>
      <div class="export-hint">タブ区切りテキストとしてコピー</div>
    </div>
  `;const C=e.querySelector("#export-btn");C.addEventListener("click",()=>{const E=wt(r,t.breaks,i);navigator.clipboard.writeText(E).then(()=>{C.textContent="✓ コピーしました",C.classList.add("copied"),setTimeout(()=>{C.textContent="クリップボードにコピー",C.classList.remove("copied")},2e3)})}),e.querySelector("#export-img-btn").addEventListener("click",()=>{kt(r,t.breaks,i,t.timing)});const H=e.querySelector("#arc-svg"),j=e.querySelector("#arc-tooltip");H&&j&&(H.querySelectorAll(".arc-path").forEach(E=>{E.addEventListener("mouseenter",_=>{const U=E.dataset.member;_e(e,H,U),j.textContent=U,j.classList.add("visible")}),E.addEventListener("mousemove",_=>{const U=j.parentElement.getBoundingClientRect();j.style.left=_.clientX-U.left+8+"px",j.style.top=_.clientY-U.top-24+"px"}),E.addEventListener("mouseleave",()=>{Te(e,H),j.classList.remove("visible")})}),H.querySelectorAll(".arc-dot").forEach(E=>{E.addEventListener("mouseenter",()=>{const _=E.dataset.bandSlot;if(_!==void 0){const U=parseInt(_,10);H.classList.add("has-highlight"),H.querySelectorAll(`.arc-path[data-from="${U}"], .arc-path[data-to="${U}"]`).forEach(Q=>{Q.classList.add("arc-active")}),E.classList.add("arc-active")}}),E.addEventListener("mouseleave",()=>{Te(e,H)})}));let Y=null;function u(E){F();const _=e.querySelector(`.member-row[data-member="${CSS.escape(E)}"]`);_&&_.classList.add("active"),H&&_e(e,H,E),It(E,f,i)}function F(){e.querySelectorAll(".member-row.active").forEach(E=>E.classList.remove("active")),H&&Te(e,H),St()}e.querySelectorAll(".member-row").forEach(E=>{const _=E.dataset.member;_&&(E.addEventListener("mouseenter",()=>{Y||u(_)}),E.addEventListener("mouseleave",()=>{Y||F()}),E.addEventListener("click",()=>{Y===_?(Y=null,F()):(Y=_,u(_))}))})}function At(e,t,n){const i=e.length;if(i<2)return"";const r=240,s=110,d=r/(i+1);let a="",c="",p="";e.forEach((o,y)=>{const B=d*(y+1),P=t[o],k=P?P.name.slice(0,3):String(y+1);c+=`<circle class="arc-dot" data-band-slot="${y}" cx="${B}" cy="${s}" r="4" fill="var(--gold)" opacity="0.6" style="cursor:pointer"/>`,p+=`<text class="arc-label-text" data-band-slot="${y}" x="${B}" y="${s+14}" text-anchor="middle" font-size="5.5" font-family="Outfit, Noto Sans JP, sans-serif" fill="var(--text-3)">${R(k)}</text>`});const L=[];for(let o=0;o<i;o++)for(let y=o+1;y<i;y++){const B=t[e[o]],P=t[e[y]];if(!B||!P)continue;const k=B.members.filter(g=>g!=="n/a"&&P.members.includes(g)),A=[...new Set(k)];for(const g of A)L.push({from:o,to:y,member:g,consecutive:y===o+1})}L.sort((o,y)=>o.consecutive!==y.consecutive?o.consecutive?-1:1:o.to-o.from-(y.to-y.from));const v={};for(const o of L){const y=d*(o.from+1),B=d*(o.to+1),P=o.to-o.from,k=`${o.from}-${o.to}`,A=v[k]||0;v[k]=A+1;const q=(o.consecutive?16:22+P*6)+A*10,V=Math.min(q,s-8),f=we(n,o.member),I=o.consecutive?.5:.2,b=o.consecutive?1.5:1,S=o.consecutive?"":'stroke-dasharray="3,2"';a+=`<path class="arc-path" data-member="${R(o.member)}" data-from="${o.from}" data-to="${o.to}" d="M${y},${s} Q${(y+B)/2},${s-V} ${B},${s}" fill="none" stroke="${f}" stroke-width="${b}" opacity="${I}" ${S} style="cursor:pointer"/>`}return a+c+p}function _e(e,t,n){t.classList.add("has-highlight"),t.querySelectorAll(`.arc-path[data-member="${CSS.escape(n)}"]`).forEach(s=>{s.classList.add("arc-active")});const i=t.querySelectorAll(".arc-path.arc-active"),r=new Set;i.forEach(s=>{r.add(s.dataset.from),r.add(s.dataset.to)}),r.forEach(s=>{t.querySelectorAll(`[data-band-slot="${s}"]`).forEach(d=>d.classList.add("arc-active"))})}function Te(e,t){t.classList.remove("has-highlight"),t.querySelectorAll(".arc-active").forEach(n=>n.classList.remove("arc-active"))}function It(e,t,n){const i=document.getElementById("timeline-body");if(!i)return;i.querySelectorAll(".band-card").forEach((s,d)=>{if(d>=t.length)return;const a=n[t[d]];a&&a.members.includes(e)&&(s.classList.add("member-highlight"),s.querySelectorAll(".member-dot").forEach(c=>{c.textContent.includes(e)&&c.classList.add("member-highlight")}))})}function St(){const e=document.getElementById("timeline-body");e&&e.querySelectorAll(".member-highlight").forEach(t=>t.classList.remove("member-highlight"))}function kt(e,t,n,i,r,s){const d=Le(t),a=i.minUnit||5,c=i.transitionTime||5;let p=Ee(i.startTime||"12:00");const L=[];for(let T=0;T<e.length;T++){const w=e[T],D=n[w.bandIndex],J=p,se=J+w.perfTime+c,Z=Math.ceil(se/a)*a,X=D?D.members:[],ee=[];for(let te=0;te<X.length;te++)X[te]!=="n/a"&&ee.push({part:fe[te],name:X[te]});L.push({name:w.name,start:de(J),end:de(Z),perfTime:w.perfTime,cost:w.cost,memberParts:ee}),p=Z,d.has(T)&&(L.push({isBreak:!0,duration:d.get(T)}),p+=d.get(T))}const v=2,o=32,y=28,B=56,P=28,k=52,A=36,g=110,q=180,V=280,f=o*2+g+q+V,b=document.createElement("canvas").getContext("2d");function S(T,w,D,J){if(T.font=J,T.measureText(w).width<=D)return[w];if(w.includes(" ")){const ee=w.split(" "),te=[];let ie=ee[0];for(let ue=1;ue<ee.length;ue++){const oe=ie+" "+ee[ue];T.measureText(oe).width>D?(te.push(ie),ie=ee[ue]):ie=oe}return ie&&te.push(ie),te}const Z=[];let X="";for(const ee of w)T.measureText(X+ee).width>D&&X.length>0?(Z.push(X),X=ee):X+=ee;return X&&Z.push(X),Z}const N="600 12px Outfit, Noto Sans JP, sans-serif",C=q-16,K=L.map(T=>{if(T.isBreak)return P;const D=S(b,T.name,C,N).length*15;return Math.max(B,D+32+12)});let H=k;for(const T of K)H+=T;H+=A;const j=y*2+H,Y=document.createElement("canvas");Y.width=f*v,Y.height=j*v;const u=Y.getContext("2d");u.scale(v,v);const F=getComputedStyle(document.documentElement),E=F.getPropertyValue("--bg-0").trim()||"#08090c",_=F.getPropertyValue("--bg-2").trim()||"#14161d",U=F.getPropertyValue("--bg-3").trim()||"#1a1d27",Q=F.getPropertyValue("--text-0").trim()||"#eae8e3",ae=F.getPropertyValue("--text-1").trim()||"#b0ada5",le=F.getPropertyValue("--text-2").trim()||"#706d65",l=F.getPropertyValue("--gold").trim()||"#d4a843",m=F.getPropertyValue("--border").trim()||"#1e2130";F.getPropertyValue("--green").trim(),F.getPropertyValue("--red").trim(),u.fillStyle=E,u.fillRect(0,0,f,j);let h=y;const z=L.find(T=>!T.isBreak)?.start||"--:--",$=L.filter(T=>!T.isBreak).pop()?.end||"--:--";u.fillStyle=Q,u.font="600 14px Outfit, Noto Sans JP, sans-serif",u.fillText("タイムテーブル",o,h+20),u.fillStyle=ae,u.font="500 10px JetBrains Mono, monospace",u.textAlign="right",u.fillText(`${z} → ${$}`,f-o,h+20),u.textAlign="left",h+=k,u.fillStyle=U,u.fillRect(o,h-4,f-o*2,22),u.fillStyle=le,u.font="500 8.5px JetBrains Mono, monospace",u.fillText("TIME",o+8,h+10),u.fillText("BAND",o+g+8,h+10),u.fillText("MEMBERS",o+g+q+8,h+10),h+=22;for(let T=0;T<L.length;T++){const w=L[T];if(w.isBreak){u.fillStyle=U,u.fillRect(o,h,f-o*2,P),u.strokeStyle=l,u.lineWidth=2,u.beginPath(),u.moveTo(o,h),u.lineTo(o,h+P),u.stroke(),u.fillStyle=l,u.font="500 10px Outfit, Noto Sans JP, sans-serif",u.fillText(`休憩 ${w.duration}分`,o+12,h+P/2+4),h+=P;continue}const D=K[T],J=L.slice(0,T).filter(oe=>!oe.isBreak).length;u.fillStyle=J%2===0?_:E,u.fillRect(o,h,f-o*2,D),u.strokeStyle=m,u.lineWidth=.5,u.beginPath(),u.moveTo(o,h+D),u.lineTo(f-o,h+D),u.stroke(),u.fillStyle=l,u.font="600 11px JetBrains Mono, monospace",u.fillText(`${w.start}`,o+8,h+18),u.fillStyle=le,u.font="400 9px JetBrains Mono, monospace",u.fillText(`〜${w.end}`,o+8,h+32);const se=S(u,w.name,C,N);u.fillStyle=Q,u.font=N,se.forEach((oe,$e)=>{u.fillText(oe,o+g+8,h+16+$e*15)});const Z=16+se.length*15;u.fillStyle=le,u.font="400 8px JetBrains Mono, monospace",u.fillText(`${w.perfTime}min`,o+g+8,h+Z+2);const X=o+g+q+8,ee=V-16,te=Math.ceil(w.memberParts.length/2),ie=w.memberParts.slice(0,te),ue=w.memberParts.slice(te);[ie,ue].forEach((oe,$e)=>{let he=X;const Ce=h+18+$e*16;for(const ge of oe){u.fillStyle=le,u.font="400 7px JetBrains Mono, monospace",u.fillText(ge.part,he,Ce);const Be=u.measureText(ge.part).width+2;if(u.fillStyle=ae,u.font="400 9px Outfit, Noto Sans JP, sans-serif",u.fillText(ge.name,he+Be,Ce),he+=Be+u.measureText(ge.name).width+10,he>X+ee)break}}),h+=D}h+=8,u.fillStyle=le,u.font="400 8px JetBrains Mono, monospace",u.fillText(new Date().toLocaleDateString("ja-JP"),o,h+12);const O=Y.toDataURL("image/png"),G=document.createElement("a");G.href=O,G.download="timetable.png",G.style.display="none",document.body.appendChild(G),G.click(),setTimeout(()=>document.body.removeChild(G),500)}function wt(e,t,n){const i=Le(t),r=[];for(let s=0;s<e.length;s++){const d=e[s],a=n&&n[d.bandIndex],c=a?a.members.join("	"):"";r.push(`${d.startTime}〜${d.endTime}	${d.name}	${c}	${d.perfTime}分`);const p=i.get(s);p!==void 0&&r.push(`	休憩 (${p}分)`)}return r.join(`
`)}const Mt=Ve(),Ke=document.getElementById("theme-switcher");function Xe(e){Ke.querySelectorAll(".theme-btn").forEach(t=>{t.classList.toggle("active",t.dataset.theme===e)})}Xe(Mt);Ke.addEventListener("click",e=>{const t=e.target.closest(".theme-btn");if(!t)return;const n=nt(t.dataset.theme);Xe(n),x.results&&Fe(Ze,x)});const Qe=document.getElementById("left-panel");document.getElementById("center-panel");const Ze=document.getElementById("right-panel"),Oe=document.getElementById("empty-state"),De=document.getElementById("timeline-container"),Ae=document.getElementById("timeline-body"),Ie=document.getElementById("timeline-controls"),ye=document.getElementById("optimize-bar"),He=document.getElementById("optimize-status"),re=document.getElementById("optimize-btn"),x={players:ne("players",[]),bands:ne("bands",[]),costWeights:ne("costWeights",[0,1,1,1,0,1]),rules:ne("rules",[]),distinguishGuitar:ne("distinguishGuitar",!0),timing:ne("timing",{minUnit:5,transitionTime:5,startTime:"12:00"}),results:null,selectedResultIndex:0,schedule:null,breaks:ne("breaks",[])};function et(e){return we(x.players,e)}function Pt(){be(),ve(),document.dispatchEvent(new CustomEvent("themis:dataChanged"))}function Nt(){x.results=null,x.schedule=null,x.selectedResultIndex=0,Ne(),be(),ve()}function Me(){be(),ve()}function Ct(e=!1){x.schedule&&(be(e),ve())}function Bt(){const e=x.bands;if(e.length<2){Se("warn","バンドが足りません","最適化するには最低2つのバンドを登録してください。");return}const t=yt(x.rules);re.textContent="最適化中...",re.disabled=!0,setTimeout(()=>{try{const n=Je(e,{distinguishGuitar:x.distinguishGuitar,freeLeave:!1,costWeights:x.costWeights,constraints:t},8);x.results=n,x.selectedResultIndex=0,x.breaks=[],W("breaks",[]),n.length>0?x.schedule=Pe(n[0]):(x.schedule=null,Se("error","解が見つかりません","設定されたルールの組み合わせを満たすタイムテーブルが存在しません。ルールを緩和するか、一部のルールを削除してください。",1e4)),Me()}catch(n){const i=qt(n.message);Se("error",i.title,i.body)}finally{re.textContent="最適化を実行",re.disabled=!1}},16)}function qt(e){if(e.includes("Too many bands")){const t=e.match(/\((\d+)\)/);return{title:"バンド数が多すぎます",body:`現在${t?t[1]:"?"}バンドが登録されていますが、最適化できるのは最大20バンドまでです。バンド数を減らすか、不要なデータを削除してください。`}}return{title:"最適化エラー",body:e}}re.addEventListener("click",Bt);function Pe(e){const t=dt(x.bands,e.path,x.distinguishGuitar,!1,x.costWeights);return xt(t,x.bands,x.timing.minUnit,x.timing.transitionTime,x.timing.startTime)}function Rt(e){!x.results||e>=x.results.length||(x.selectedResultIndex=e,x.schedule=Pe(x.results[e]),x.breaks=x.breaks.filter(t=>t.afterIndex<x.schedule.length-1),W("breaks",x.breaks),Me())}function _t(){if(!x.results)return;const e=x.results[x.selectedResultIndex];e&&(x.schedule=Pe(e),Me())}function Ne(){const e=x.bands;if(e.length<2){ye.classList.add("hidden");return}ye.classList.remove("hidden");const t=x.rules.length,n=x._ruleWarnings||[];n.length>0?(ye.classList.add("has-warnings"),He.innerHTML=`<span class="opt-warn">⚠ ${n.length}件の問題があります</span>`,re.disabled=!0,re.title=n[0]):(ye.classList.remove("has-warnings"),He.innerHTML=`<span class="check">✓</span> ${e.length} bands · ${t} rules`,re.disabled=!1,re.title="")}function be(e=!1){const t=x.bands;if(t.length===0){Oe.classList.remove("hidden"),De.classList.add("hidden");return}Oe.classList.add("hidden"),De.classList.remove("hidden"),x.results&&x.results.length>0&&x.schedule?(Lt(Ie,x),$t(Ae,x,et,Ct,e)):t.length>=2?(Ie.innerHTML="",Ot(Ae,t)):(Ie.innerHTML="",Ae.innerHTML='<div style="padding:2rem;text-align:center;color:var(--text-3);font-size:0.8rem;">最低2つのバンドを登録してください。</div>')}function Ot(e,t){e.innerHTML=t.map((n,i)=>{const r=n.members.map((s,d)=>{if(s==="n/a")return"";const a=et(s);return`<span class="member-dot" style="color:${a};background:${a}15">${R(s)}<span class="part-label">${fe[d]}</span></span>`}).filter(Boolean).join("");return`
      <div class="band-card" style="animation: fadeSlide 0.3s ease-out ${i*.04}s both">
        <div class="band-card-inner">
          <div class="band-order">${i+1}</div>
          <div class="band-main">
            <div class="band-name">${R(n.name)}</div>
            <div class="band-members">${r}</div>
          </div>
          <div class="band-time-col">
            <span class="band-duration">${n.estimatedTime}min</span>
          </div>
        </div>
      </div>
    `}).join("")}function ve(){Fe(Ze,x)}document.addEventListener("themis:selectResult",e=>{Rt(e.detail.index)});document.addEventListener("themis:timingChanged",()=>{_t()});document.addEventListener("themis:rulesValidated",e=>{x._ruleWarnings=e.detail.warnings,Ne()});rt(Qe,x,Pt);pt(Qe,x,Nt);Ne();be();ve();{let p=function(L,v){const o=document.getElementById(L);if(!o)return;let y,B;function P(g){g.preventDefault(),o.classList.add("dragging"),document.body.classList.add("resizing"),y=g.clientX,B=v==="left"?a:c,document.addEventListener("mousemove",k),document.addEventListener("mouseup",A)}function k(g){const q=g.clientX-y;v==="left"?(a=Math.max(t,Math.min(n,B+q)),e.style.setProperty("--left-w",a+"px")):(c=Math.max(i,Math.min(r,B-q)),e.style.setProperty("--right-w",c+"px"))}function A(){o.classList.remove("dragging"),document.body.classList.remove("resizing"),document.removeEventListener("mousemove",k),document.removeEventListener("mouseup",A),W("panelLeftW",a),W("panelRightW",c)}o.addEventListener("mousedown",P)};var Dt=p;const e=document.querySelector(".layout"),t=240,n=480,i=240,r=440,s=340,d=320;let a=ne("panelLeftW",s),c=ne("panelRightW",d);a=Math.max(t,Math.min(n,a)),c=Math.max(i,Math.min(r,c)),e.style.setProperty("--left-w",a+"px"),e.style.setProperty("--right-w",c+"px"),p("resize-left","left"),p("resize-right","right")}function Se(e,t,n,i=6e3){const r=document.getElementById("toast-container"),s=document.createElement("div");s.className=`toast toast-${e}`,s.innerHTML=`
    <div class="toast-title">${R(t)}</div>
    ${n?`<div class="toast-body">${R(n)}</div>`:""}
  `,r.appendChild(s),setTimeout(()=>{s.classList.add("removing"),s.addEventListener("animationend",()=>s.remove())},i),s.addEventListener("click",()=>{s.classList.add("removing"),s.addEventListener("animationend",()=>s.remove())})}
