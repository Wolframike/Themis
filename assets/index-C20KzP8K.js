(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const u of s.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&i(u)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();const Ne="themis_";function V(e,t){try{localStorage.setItem(Ne+e,JSON.stringify(t))}catch{}}function Q(e,t=null){try{const n=localStorage.getItem(Ne+e);return n===null?t:JSON.parse(n)}catch{return t}}const Ce="theme",Be=["dark","light"];function Ve(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function qe(e){document.documentElement.setAttribute("data-theme",e)}function Re(){const e=Q(Ce),t=Be.includes(e)?e:Ve();return qe(t),t}function Je(e){return Be.includes(e)?(qe(e),V(Ce,e),e):Re()}function Ye(e,t){const n=[],i=[],r=new Set,s=e.split(`
`).filter(u=>u.trim()!=="");for(let u=0;u<s.length;u++){const a=u+1,m=s[u].split("	");if(m.length<8){i.push({row:a,message:`${a}行目: 列数が不足しています（${m.length}列）。最低8列（バンド名、6パート、時間）が必要です。`});continue}const L=m[m.length-1].trim(),v=m[m.length-2].trim(),o=m[m.length-3].trim(),E=m[m.length-4].trim(),N=m[m.length-5].trim(),P=m[m.length-6].trim(),k=m[m.length-7].trim(),g=m.slice(0,m.length-7).join("	").trim();if(!g){i.push({row:a,message:`${a}行目: バンド名が空です。`});continue}const C=[{label:"Vo.",value:k},{label:"L.Gt",value:P},{label:"B.Gt",value:N},{label:"Ba.",value:E},{label:"Dr.",value:o},{label:"Key.",value:v}];let z=!1;for(const b of C)b.value.includes(" ")&&(i.push({row:a,message:`${a}行目: ${b.label}のセル「${b.value}」にスペースが含まれています。セル内にスペースは使用できません。`}),z=!0);if(z)continue;const f=Fe(L,a);if(f.error){i.push(f.error);continue}const x=[k,P,N,E,o,v];for(const b of x)b&&b!==t&&r.add(b);n.push({name:g,members:x,estimatedTime:f.value})}return{bands:n,errors:i,players:Array.from(r).sort()}}function Fe(e,t){const n=e.trim();if(!n)return{error:{row:t,message:`${t}行目: 演奏時間が空です。`}};if(/\d+\D+\d+/.test(n))return{error:{row:t,message:`${t}行目: 演奏時間「${n}」が曖昧です。数字が複数含まれているため、どの数字を使用すべきか判断できません。数字のみで入力してください（例: 「5」）。`}};const i=n.replace(/\D/g,"");if(!i)return{error:{row:t,message:`${t}行目: 演奏時間「${n}」に数字が含まれていません。`}};const r=parseInt(i,10);return r<=0?{error:{row:t,message:`${t}行目: 演奏時間は1分以上にしてください。`}}:{value:r}}const oe=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],Se=["var(--m1)","var(--m2)","var(--m3)","var(--m4)","var(--m5)","var(--m6)","var(--m7)","var(--m8)","var(--m9)","var(--m10)"];function q(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function pe(e){const t=e.split(":");return parseInt(t[0],10)*60+parseInt(t[1],10)}function ae(e){const t=Math.floor(e/60)%24,n=e%60;return`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function Le(e,t){const n=e.indexOf(t);return n>=0?Se[n%Se.length]:"var(--text-2)"}function me(e){const t=new Map;for(const n of e)t.set(n.afterIndex,n.duration);return t}const Ie=["vocal","leadGuitar","backingGuitar","bass","drums","keyboard"];function Ke(e,t,n){const i=Q("emptyIndicator","n/a"),r=Q("entryMode","paste"),s=document.createElement("div");s.className="panel-section open",s.dataset.panel="data",s.innerHTML=`
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
          <input class="p-input" id="empty-indicator" style="width:55px;text-align:center;font-family:var(--font-mono)" value="${q(i)}" />
          <div style="flex:1"></div>
          <button class="p-btn p-btn-accent p-btn-sm" id="paste-btn">解析</button>
        </div>
        <div class="p-row">
          <textarea class="p-textarea" id="paste-input" rows="3" placeholder="King Gnu&#9;井口&#9;常田&#9;n/a&#9;新井&#9;勢喜&#9;井口&#9;20分"></textarea>
          <div class="p-help">時間の数値はすべて「分」として扱います</div>
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
            ${oe.map((b,T)=>`
              <label class="p-label">
                ${b}
                <select class="p-select part-dropdown" id="part-${Ie[T]}">
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
  `,e.appendChild(s),s.querySelector(".panel-header").addEventListener("click",()=>{s.classList.toggle("open")});const u=s.querySelector("#band-count-badge"),a=s.querySelector("#paste-feedback"),d=s.querySelector("#paste-input"),m=s.querySelector("#empty-indicator"),L=s.querySelector("#paste-btn"),v=s.querySelector("#player-chips"),o=s.querySelector("#player-tag-input"),E=s.querySelector("#band-name-input"),N=s.querySelector("#band-time-input"),P=s.querySelector("#add-band-btn"),k=s.querySelector("#band-mini-list"),S=s.querySelector("#clear-area");function g(){u.textContent=`${t.bands.length} bands`}k.addEventListener("click",b=>{const T=b.target.closest(".band-mini-delete");if(!T)return;const c=parseInt(T.dataset.index,10);t.bands.splice(c,1),V("bands",t.bands),f(),g(),n()}),s.querySelectorAll(".p-tab").forEach(b=>{b.addEventListener("click",()=>{s.querySelectorAll(".p-tab").forEach(c=>c.classList.remove("active")),b.classList.add("active");const T=b.dataset.tab;s.querySelector("#data-tab-paste").classList.toggle("hidden",T!=="paste"),s.querySelector("#data-tab-manual").classList.toggle("hidden",T!=="manual"),V("entryMode",T)})}),m.addEventListener("input",()=>{V("emptyIndicator",m.value.trim()||"n/a")}),d.addEventListener("input",()=>{d.style.height="auto",d.style.height=d.scrollHeight+"px"}),L.addEventListener("click",()=>{const b=d.value.trim();if(!b){a.innerHTML='<div class="p-error">テキストが入力されていません。</div>';return}const T=m.value.trim()||"n/a",c=Ye(b,T);if(c.errors.length>0){a.innerHTML=c.errors.map(_=>`<div class="p-error">${q(_.message)}</div>`).join("");return}const M=new Set(t.players);for(const _ of c.players)M.has(_)||(t.players.push(_),M.add(_));V("players",t.players);const F=new Set(t.bands.map(_=>_.name.toLowerCase())),U=[];let O=0;for(const _ of c.bands)F.has(_.name.toLowerCase())?U.push(_.name):(t.bands.push(_),F.add(_.name.toLowerCase()),O++);V("bands",t.bands),d.value="";let J="";O>0&&(J+=`<div class="p-success">✓ ${O}バンド登録 · ${c.players.length}人検出</div>`),U.length>0&&(J+=`<div class="p-error" style="margin-top:0.3rem">重複のためスキップ: ${U.map(q).join("、")}</div>`),!O&&U.length>0&&(J=`<div class="p-error">全て既に登録済みのバンドです: ${U.map(q).join("、")}</div>`),a.innerHTML=J,C(),z(),f(),g(),n()});function C(){v.innerHTML=t.players.map(b=>`<span class="p-chip">${q(b)}<button type="button" class="p-chip-delete" data-name="${q(b)}">✕</button></span>`).join("")}v.addEventListener("click",b=>{const T=b.target.closest(".p-chip-delete");T&&(t.players=t.players.filter(c=>c!==T.dataset.name),V("players",t.players),C(),z(),n())}),o.addEventListener("keydown",b=>{if(b.key==="Enter"){b.preventDefault();const T=o.value.trim();T&&!t.players.includes(T)&&(t.players.push(T),V("players",t.players),C(),z()),o.value=""}});function z(){s.querySelectorAll(".part-dropdown").forEach(b=>{const T=b.value;b.innerHTML='<option value="n/a">— 空き —</option>';for(const c of t.players){const M=document.createElement("option");M.value=c,M.textContent=c,c===T&&(M.selected=!0),b.appendChild(M)}})}P.addEventListener("click",()=>{const b=E.value.trim(),T=parseInt(N.value,10);if(!b||!T||T<=0)return;if(t.bands.some(M=>M.name.toLowerCase()===b.toLowerCase())){E.style.borderColor="var(--red)";let M=s.querySelector("#band-dupe-warn");M||(M=document.createElement("div"),M.id="band-dupe-warn",M.className="p-error",E.parentElement.appendChild(M)),M.textContent=`「${b}」は既に登録されています。`,setTimeout(()=>{E.style.borderColor="",M&&M.remove()},3e3);return}const c=Ie.map(M=>{const F=s.querySelector(`#part-${M}`);return F?F.value:"n/a"});t.bands.push({name:b,members:c,estimatedTime:T}),V("bands",t.bands),E.value="",N.value="",f(),g(),n()});function f(){if(t.bands.length===0){k.innerHTML='<div style="font-size:0.68rem;color:var(--text-3);padding:0.3rem 0">バンドが登録されていません</div>';return}k.innerHTML=t.bands.map((b,T)=>`
      <div class="band-mini-item">
        <span class="band-mini-name">${q(b.name)}</span>
        <span class="band-mini-time">${b.estimatedTime}分</span>
        <button type="button" class="band-mini-delete" data-index="${T}">✕</button>
      </div>
    `).join("")}let x=!1;S.querySelector("#clear-all-btn").addEventListener("click",b=>{if(b.stopPropagation(),x)return;x=!0;const T=S.querySelector("#clear-all-btn");T.classList.add("hidden");const c=document.createElement("div");c.className="clear-confirm-bar",c.innerHTML=`
      <span class="clear-confirm-text">全て削除しますか？</span>
      <button type="button" class="p-btn p-btn-danger p-btn-sm" id="confirm-yes">削除</button>
      <button type="button" class="p-btn p-btn-sm" id="confirm-no">取消</button>
    `,S.appendChild(c),c.querySelector("#confirm-yes").addEventListener("click",M=>{M.stopPropagation(),t.players=[],t.bands=[],V("players",[]),V("bands",[]),C(),z(),f(),g(),c.remove(),T.classList.remove("hidden"),x=!1,n()}),c.querySelector("#confirm-no").addEventListener("click",M=>{M.stopPropagation(),c.remove(),T.classList.remove("hidden"),x=!1})}),C(),z(),f()}const be=0,re=1,ie=2,Xe=3,Qe=5,_e=[0,1,1,1,0,1];function se(e,t,n){return e===t||n&&e!=="n/a"&&t==="n/a"?0:1}function Ee(e,t,n,i,r){const s=r||_e;let u=0;if(n)for(let a=0;a<=5;a++)u+=se(e[a],t[a],i)*s[a];else{u+=se(e[be],t[be],i)*s[be];const a=Math.max(s[re],s[ie]),d=se(e[re],t[re],i)*a+se(e[ie],t[ie],i)*a,m=se(e[re],t[ie],i)*a+se(e[ie],t[re],i)*a;u+=Math.min(d,m);for(let L=Xe;L<=Qe;L++)u+=se(e[L],t[L],i)*s[L]}return u}function Ze(e){return e=e-(e>>1&1431655765),e=(e&858993459)+(e>>2&858993459),(e+(e>>4)&252645135)*16843009>>24}function Oe(e,t={},n=3){const{distinguishGuitar:i=!0,freeLeave:r=!1,costWeights:s,constraints:u={}}=t,{fixedLast:a=null,rules:d=[],fixedPositions:m=[],bandOrdering:L=[],playerAppearance:v=[],consecutiveLimit:o=null,bandAdjacency:E=[],appearanceSpan:N=[]}=u,P=e.length;if(N.length>0){let G=function(j,H){if(!(h>=B)){if(j===p.length){h++;const W=[];for(let Y=0;Y<l.length;Y++){const Z=H[Y],ne=Z+l[Y].spanLimit-1;W.push({player:l[Y].player,position:Z,mode:"after"}),W.push({player:l[Y].player,position:ne,mode:"before"})}try{const Y=Oe(e,{distinguishGuitar:i,freeLeave:r,costWeights:s,constraints:{fixedLast:a,rules:d,fixedPositions:m,bandOrdering:L,playerAppearance:[...v,...W],consecutiveLimit:o,bandAdjacency:E,appearanceSpan:[]}},n);for(const Z of Y){const ne=Z.path.join(",");D.has(ne)||(D.add(ne),I.push(Z))}}catch{}return}for(const W of p[j])if(H.push(W),G(j+1,H),H.pop(),h>=B)return}};var fe=G;const l=N.map(j=>{let H=0;for(const W of e)W.members.some(Y=>Y===j.player)&&H++;return{player:j.player,spanLimit:j.spanLimit,bandCount:H}}),p=l.map(j=>{const H=[];for(let W=1;W<=P-j.spanLimit+1;W++)H.push(W);return H}),I=[],D=new Set;let h=0;const B=200;return G(0,[]),I.sort((j,H)=>j.cost-H.cost),I.slice(0,n)}const k=[];for(let l=0;l<P;l++)l!==a&&k.push(l);const S=k.length;if(S>20)throw new Error(`Too many bands for bitmask DP (${S}). Max supported is 20.`);const g=new Map;k.forEach((l,p)=>g.set(l,p));const C=d.filter(l=>g.has(l.bandIndex)).map(l=>({localIndex:g.get(l.bandIndex),maxPosition:l.maxPosition||null,minPosition:l.minPosition||null,requiredBefore:(l.requiredBefore||[]).filter(p=>g.has(p)).map(p=>g.get(p))})),z=m.filter(l=>g.has(l.bandIndex)).map(l=>({localIndex:g.get(l.bandIndex),position:l.exactPosition})),f=L.filter(l=>g.has(l.before)&&g.has(l.after)).map(l=>({before:g.get(l.before),after:g.get(l.after)})),x=[];for(const l of v){const p=[];for(let I=0;I<P;I++)I!==a&&e[I].members.some(D=>D===l.player)&&g.has(I)&&p.push(g.get(I));p.length>0&&x.push({localBands:p,position:l.position,mode:l.mode})}const b=E.filter(l=>g.has(l.before)&&g.has(l.after)).map(l=>({before:g.get(l.before),after:g.get(l.after)}));let T=null;if(o===1){T=Array.from({length:S},()=>new Uint8Array(S));for(let l=0;l<S;l++)for(let p=l+1;p<S;p++){const I=e[k[l]].members,D=e[k[p]].members;let h=!1;for(let B=0;B<I.length;B++){if(I[B]!=="n/a"){for(let G=0;G<D.length;G++)if(I[B]===D[G]){h=!0;break}}if(h)break}h&&(T[l][p]=1,T[p][l]=1)}}let c=null;o!==null&&o>=2&&(c=k.map(l=>new Set(e[l].members.filter(p=>p!=="n/a"))));const M=Array.from({length:S},()=>new Int32Array(S));for(let l=0;l<S;l++)for(let p=0;p<S;p++)l!==p&&(M[l][p]=Ee(e[k[l]].members,e[k[p]].members,i,r,s));let F=null;if(a!==null){F=new Int32Array(S);for(let l=0;l<S;l++)F[l]=Ee(e[k[l]].members,e[a].members,i,r,s)}const U=2147483647,O=1<<S,J=O-1,_=new Int32Array(S*O).fill(U),K=new Int32Array(S*O).fill(-1);function y(l){for(const p of C)if(p.localIndex===l&&(p.requiredBefore.length>0||p.minPosition&&1<p.minPosition))return!1;for(const p of z)if(p.localIndex===l&&p.position!==1||p.localIndex!==l&&p.position===1)return!1;for(const p of f)if(p.after===l)return!1;for(const p of x)if(p.mode==="after"&&p.localBands.includes(l)&&1<p.position)return!1;for(const p of b)if(p.after===l)return!1;return!0}function R(l,p,I,D){for(const h of C)if(h.localIndex===l){if(h.maxPosition&&I>h.maxPosition||h.minPosition&&I<h.minPosition)return!1;if(h.requiredBefore.length>0){let B=!1;for(const G of h.requiredBefore)if(p&1<<G){B=!0;break}if(!B)return!1}}for(const h of z)if(h.localIndex===l&&h.position!==I||h.localIndex!==l&&h.position===I)return!1;for(const h of f)if(h.after===l&&!(p&1<<h.before))return!1;for(const h of x)if(h.localBands.includes(l)&&(h.mode==="before"&&I>h.position||h.mode==="after"&&I<h.position))return!1;if(T&&D>=0&&T[D][l])return!1;if(c&&o>=2){const h=[l];let B=D,G=p;for(let j=0;j<=o-1&&(h.push(B),h.length!==o+1);j++){const H=K[B*O+G];if(H===-1)break;G^=1<<B,B=H}if(h.length===o+1){const j=c[h[0]];for(const H of j){let W=!0;for(let Y=1;Y<h.length;Y++)if(!c[h[Y]].has(H)){W=!1;break}if(W)return!1}}}for(const h of b)if(h.after===l&&D!==h.before||h.before===D&&l!==h.after)return!1;return!0}for(let l=0;l<S;l++)y(l)&&(_[l*O+(1<<l)]=0);for(let l=1;l<O;l++)for(let p=0;p<S;p++){const I=p*O+l;if(_[I]===U||!(l&1<<p))continue;const D=_[I],h=Ze(l)+1;for(let B=0;B<S;B++){if(l&1<<B||!R(B,l,h,p))continue;const G=l|1<<B,j=D+M[p][B],H=B*O+G;j<_[H]&&(_[H]=j,K[H]=p)}}const A=[];for(let l=0;l<S;l++){const p=l*O+J;if(_[p]===U)continue;const I=F!==null?_[p]+F[l]:_[p];A.push({last:l,cost:I})}if(A.length===0)return[];A.sort((l,p)=>l.cost-p.cost);const X=[],ee=new Set;for(const l of A){if(X.length>=n)break;const p=[];let I=J,D=l.last;for(;D!==-1;){p.push(D);const G=K[D*O+I];I^=1<<D,D=G}p.reverse();const h=p.map(G=>k[G]);a!==null&&h.push(a);const B=h.join(",");ee.has(B)||(ee.add(B),!(o!==null&&o>=2&&!et(h,e,o))&&X.push({path:h,cost:l.cost}))}return X}function et(e,t,n){const i=new Map;for(let r=0;r<e.length;r++){const s=new Set(t[e[r]].members.filter(a=>a!=="n/a")),u=new Map;for(const a of s){const m=(i.get(a)||0)+1;if(m>n)return!1;u.set(a,m)}i.clear();for(const[a,d]of u)i.set(a,d)}return!0}function tt(e,t,n,i,r){return t.map((s,u)=>{const a=e[s],d=u===0?null:Ee(e[t[u-1]].members,a.members,n,i,r);return{bandIndex:s,name:a.name,members:a.members,cost:d}})}const nt=_e,w={BAND_POSITION:"bandPosition",BAND_ORDER:"bandOrder",PLAYER_APPEARANCE:"playerAppearance",CONSECUTIVE_LIMIT:"consecutiveLimit",BAND_ADJACENCY:"bandAdjacency",APPEARANCE_SPAN:"appearanceSpan"};function st(e,t,n,i){const r=document.createElement("div");r.className="panel-section open",r.innerHTML=`
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
        ${oe.map((f,x)=>`
          <div class="cost-cell">
            <span class="cost-cell-label">${f}</span>
            <input type="number" min="0" max="3" value="${t.costWeights[x]}" data-idx="${x}" class="cost-weight-input" />
          </div>
        `).join("")}
      </div>
      <div style="margin-top:0.6rem">
        <label class="p-toggle-wrap">
          <input type="checkbox" class="p-toggle-input" id="distinguish-guitar" ${t.distinguishGuitar?"checked":""} />
          <span class="p-toggle-track"></span>
          <span class="p-toggle-text">ギターを区別する</span>
        </label>
      </div>
    </div>
  `,r.querySelector(".panel-header").addEventListener("click",()=>{r.classList.toggle("open")}),r.querySelectorAll(".cost-weight-input").forEach(f=>{const x=()=>{let b=parseInt(f.value,10);const T=parseInt(f.dataset.idx,10);isNaN(b)&&(b=nt[T]),b=Math.max(0,Math.min(3,b)),f.value=b,t.costWeights[T]=b,V("costWeights",t.costWeights),n()};f.addEventListener("change",x),f.addEventListener("blur",x),f.addEventListener("focus",()=>f.select())}),r.querySelector("#distinguish-guitar").addEventListener("change",f=>{t.distinguishGuitar=f.target.checked,V("distinguishGuitar",t.distinguishGuitar),n()}),e.appendChild(r);const s=document.createElement("div");s.className="panel-section",s.innerHTML=`
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
          <option value="${w.BAND_POSITION}">バンドの配置指定</option>
          <option value="${w.BAND_ORDER}">バンドの順序指定</option>
          <option value="${w.PLAYER_APPEARANCE}">メンバーの出演位置</option>
          <option value="${w.CONSECUTIVE_LIMIT}">連続出演制限</option>
          <option value="${w.BAND_ADJACENCY}">バンドの隣接指定</option>
          <option value="${w.APPEARANCE_SPAN}">出演スパン制限</option>
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
  `,s.querySelector(".panel-header").addEventListener("click",()=>{s.classList.toggle("open")});const u=s.querySelector("#rule-type-select"),a=s.querySelector("#rule-config"),d=s.querySelector("#add-rule-btn"),m=s.querySelector("#rule-error"),L=s.querySelector("#rules-list"),v=s.querySelector("#rules-count-badge");s.querySelector("#rules-validation");let o=-1;function E(){v.textContent=`${t.rules.length} rules`}function N(f){if(f==="edit"){d.textContent="保存",d.dataset.mode="edit";let x=s.querySelector("#cancel-edit-btn");x||(x=document.createElement("button"),x.id="cancel-edit-btn",x.className="p-btn p-btn-sm",x.textContent="キャンセル",x.addEventListener("click",()=>{P()}),d.parentElement.appendChild(x)),x.classList.remove("hidden")}else{d.textContent="ルールを追加",d.dataset.mode="add";const x=s.querySelector("#cancel-edit-btn");x&&x.classList.add("hidden")}}function P(){o=-1,N("add"),m.innerHTML="",k(),S()}function k(){at(a,u.value,t.bands,t.players),ut(a,t.bands.length)}u.addEventListener("change",()=>{o>=0&&P(),k()}),k(),document.addEventListener("themis:dataChanged",()=>{k(),g()});function S(){ot(L,t.rules,o,{onDelete(f){o===f?P():o>f&&o--,t.rules.splice(f,1),V("rules",t.rules),E(),S(),g(),n()},onEdit(f){o=f;const x=t.rules[f];u.value=x.type,k(),rt(a,x),N("edit"),S()}}),E()}d.addEventListener("click",()=>{m.innerHTML="";const f=it(a,u.value,t.bands,t.players,t.rules);if(f&&f.error){m.innerHTML=`<div class="rule-error-msg">${q(f.error)}</div>`;return}f&&(o>=0?(t.rules[o]=f,o=-1,N("add")):t.rules.push(f),V("rules",t.rules),k(),S(),g(),n())});function g(){const f=ct(t.rules,t.bands);document.dispatchEvent(new CustomEvent("themis:rulesValidated",{detail:{warnings:f}}))}S(),N("add"),g(),e.appendChild(s);const C=document.createElement("div");C.className="panel-section",C.innerHTML=`
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
  `,C.querySelector(".panel-header").addEventListener("click",()=>{C.classList.toggle("open")});function z(){const f=parseInt(C.querySelector("#timing-unit").value,10)||5,x=parseInt(C.querySelector("#timing-transition").value,10)||5,b=C.querySelector("#timing-start").value||"12:00";t.timing={minUnit:f,transitionTime:x,startTime:b},V("timing",t.timing)}["#timing-start","#timing-transition","#timing-unit"].forEach(f=>{C.querySelector(f).addEventListener("change",()=>{z(),document.dispatchEvent(new CustomEvent("themis:timingChanged"))})}),e.appendChild(C)}function at(e,t,n,i){const r=n.map((u,a)=>`<option value="${a}">${q(u.name)}</option>`).join(""),s=i.map(u=>`<option value="${q(u)}">${q(u)}</option>`).join("");switch(t){case w.BAND_POSITION:e.innerHTML=`
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
      `;break;case w.BAND_ORDER:e.innerHTML=`
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
      `;break;case w.PLAYER_APPEARANCE:e.innerHTML=`
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
      `;break;case w.CONSECUTIVE_LIMIT:e.innerHTML=`
        <div class="rule-builder-row">
          <span>同一メンバー連続最大</span>
          <input type="number" id="rc-consec-limit" class="p-input p-input-narrow" min="1" max="${n.length}" value="2" />
          <span>バンド</span>
        </div>
        <div id="consec-warning" class="rule-warning" style="display:none;">
          1に設定すると、解が見つからない場合があります。
        </div>
      `;{const u=e.querySelector("#rc-consec-limit"),a=e.querySelector("#consec-warning");u&&a&&u.addEventListener("input",()=>{a.style.display=parseInt(u.value,10)===1?"":"none"})}break;case w.BAND_ADJACENCY:e.innerHTML=`
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
      `;break;case w.APPEARANCE_SPAN:e.innerHTML=`
        <div class="rule-builder-row">
          <select id="rc-span-player" class="p-select">${s}</select>
          <span>の最初の出演から最後の出演までは</span>
          <input type="number" id="rc-span-limit" class="p-input p-input-narrow" min="1" max="${n.length}" value="3" />
          <span>バンド以内</span>
        </div>
      `;break}}function rt(e,t){switch(t.type){case w.BAND_POSITION:{const n=e.querySelector("#rc-band"),i=e.querySelector("#rc-pos-mode"),r=e.querySelector("#rc-position");n&&(n.value=String(t.bandIndex)),i&&(i.value=t.mode),r&&(r.value=t.position);break}case w.BAND_ORDER:{const n=e.querySelector("#rc-band-a"),i=e.querySelector("#rc-band-b"),r=e.querySelector("#rc-order-dir");n&&(n.value=String(t.before)),i&&(i.value=String(t.after)),r&&(r.value="before");break}case w.PLAYER_APPEARANCE:{const n=e.querySelector("#rc-player"),i=e.querySelector("#rc-appear-mode"),r=e.querySelector("#rc-appear-pos");n&&(n.value=t.player),i&&(i.value=t.mode),r&&(r.value=t.position);break}case w.CONSECUTIVE_LIMIT:{const n=e.querySelector("#rc-consec-limit");n&&(n.value=t.limit);break}case w.BAND_ADJACENCY:{const n=e.querySelector("#rc-adj-band-a"),i=e.querySelector("#rc-adj-band-b"),r=e.querySelector("#rc-adj-dir");n&&(n.value=String(t.bandA)),i&&(i.value=String(t.bandB)),r&&(r.value=t.direction);break}case w.APPEARANCE_SPAN:{const n=e.querySelector("#rc-span-player"),i=e.querySelector("#rc-span-limit");n&&(n.value=t.player),i&&(i.value=t.spanLimit);break}}}function it(e,t,n,i,r,s){const u=n.length;switch(t){case w.BAND_POSITION:{const a=parseInt(e.querySelector("#rc-band")?.value,10),d=e.querySelector("#rc-pos-mode")?.value,m=parseInt(e.querySelector("#rc-position")?.value,10);return isNaN(a)||isNaN(m)||m<1?null:m>u?{error:`${m}番目は存在しません（バンドは${u}つ）。`}:{type:w.BAND_POSITION,bandIndex:a,bandName:n[a]?.name||"",mode:d,position:m}}case w.BAND_ORDER:{const a=parseInt(e.querySelector("#rc-band-a")?.value,10),d=parseInt(e.querySelector("#rc-band-b")?.value,10),m=e.querySelector("#rc-order-dir")?.value;if(isNaN(a)||isNaN(d))return null;if(a===d)return{error:"同じバンドを指定することはできません。"};const L=m==="before"?a:d,v=m==="before"?d:a;return{type:w.BAND_ORDER,before:L,after:v,beforeName:n[L]?.name||"",afterName:n[v]?.name||""}}case w.PLAYER_APPEARANCE:{const a=e.querySelector("#rc-player")?.value,d=e.querySelector("#rc-appear-mode")?.value,m=parseInt(e.querySelector("#rc-appear-pos")?.value,10);return!a||isNaN(m)||m<1?null:{type:w.PLAYER_APPEARANCE,player:a,mode:d,position:m}}case w.CONSECUTIVE_LIMIT:{const a=parseInt(e.querySelector("#rc-consec-limit")?.value,10);return isNaN(a)||a<1?null:{type:w.CONSECUTIVE_LIMIT,limit:a}}case w.BAND_ADJACENCY:{const a=parseInt(e.querySelector("#rc-adj-band-a")?.value,10),d=parseInt(e.querySelector("#rc-adj-band-b")?.value,10),m=e.querySelector("#rc-adj-dir")?.value;return isNaN(a)||isNaN(d)?null:a===d?{error:"同じバンドを指定することはできません。"}:{type:w.BAND_ADJACENCY,bandA:a,bandB:d,bandAName:n[a]?.name||"",bandBName:n[d]?.name||"",direction:m}}case w.APPEARANCE_SPAN:{const a=e.querySelector("#rc-span-player")?.value,d=parseInt(e.querySelector("#rc-span-limit")?.value,10);return!a||isNaN(d)||d<1?null:{type:w.APPEARANCE_SPAN,player:a,spanLimit:d}}}return null}function ot(e,t,n,i){if(t.length===0){e.innerHTML='<div style="font-size:0.68rem;color:var(--text-3)">ルールなし — デフォルトで最適化</div>';return}e.innerHTML=t.map((r,s)=>{const u=s===n;return`
      <div class="rule-chip ${u?"rule-editing":""}" data-index="${s}">
        <span class="rule-chip-text">${lt(r)}</span>
        <span class="rule-chip-actions">
          ${u?'<span class="rule-editing-label">編集中</span>':`<button type="button" class="rule-edit-btn" data-index="${s}" title="編集">✎</button>`}
          <button type="button" class="x" data-index="${s}" title="削除">✕</button>
        </span>
      </div>
    `}).join(""),e.querySelectorAll(".x").forEach(r=>{r.addEventListener("click",s=>{s.stopPropagation(),i.onDelete(parseInt(r.dataset.index,10))})}),e.querySelectorAll(".rule-edit-btn").forEach(r=>{r.addEventListener("click",s=>{s.stopPropagation(),i.onEdit(parseInt(r.dataset.index,10))})})}function lt(e){switch(e.type){case w.BAND_POSITION:return e.mode==="exactly"?`${q(e.bandName)} → ${e.position}番目`:e.mode==="after"?`${q(e.bandName)} → ${e.position}番目以降`:`${q(e.bandName)} → ${e.position}番目以前`;case w.BAND_ORDER:return`${q(e.beforeName)} → ${q(e.afterName)}の前`;case w.PLAYER_APPEARANCE:return`${q(e.player)} → ${e.position}番目${e.mode==="before"?"以前":"以降"}`;case w.CONSECUTIVE_LIMIT:return`連続制限: 最大${e.limit}バンド`;case w.BAND_ADJACENCY:return`${q(e.bandAName)} → ${q(e.bandBName)}の${e.direction==="rightBefore"?"直前":"直後"}`;case w.APPEARANCE_SPAN:return`${q(e.player)} → 出演スパン${e.spanLimit}バンド以内`;default:return"不明なルール"}}function ct(e,t){const n=[],i=t.length;if(i===0)return n;i>20&&n.push(`バンドが${i}つ登録されていますが、最適化できるのは最大20バンドです。`);const r=new Map,s=new Map;for(const a of e)if(!(a.type!==w.BAND_POSITION||a.mode!=="exactly")){if(r.has(a.bandIndex)){const d=r.get(a.bandIndex);d!==a.position&&n.push(`「${a.bandName}」が${d}番目と${a.position}番目の両方に固定されています。`)}r.set(a.bandIndex,a.position),s.has(a.position)||s.set(a.position,new Map),s.get(a.position).set(a.bandIndex,a.bandName)}for(const[a,d]of s)d.size>1&&n.push(`${a}番目に複数のバンド（${[...d.values()].join("、")}）が固定されています。`);const u=e.filter(a=>a.type===w.BAND_ORDER);for(const a of u)for(const d of u)a.before===d.after&&a.after===d.before&&n.push(`「${t[a.before]?.name}」と「${t[a.after]?.name}」が互いに相手の前に配置するよう指定されています（矛盾）。`);return n}function dt(e){const t={fixedLast:null,rules:[],fixedPositions:[],bandOrdering:[],playerAppearance:[],consecutiveLimit:null,bandAdjacency:[],appearanceSpan:[]};for(const n of e)switch(n.type){case w.BAND_POSITION:n.mode==="exactly"?t.fixedPositions.push({bandIndex:n.bandIndex,exactPosition:n.position}):n.mode==="after"?t.rules.push({bandIndex:n.bandIndex,minPosition:n.position,requiredBefore:[]}):t.rules.push({bandIndex:n.bandIndex,maxPosition:n.position,requiredBefore:[]});break;case w.BAND_ORDER:t.bandOrdering.push({before:n.before,after:n.after});break;case w.PLAYER_APPEARANCE:t.playerAppearance.push({player:n.player,position:n.position,mode:n.mode});break;case w.CONSECUTIVE_LIMIT:(t.consecutiveLimit===null||n.limit<t.consecutiveLimit)&&(t.consecutiveLimit=n.limit);break;case w.BAND_ADJACENCY:{const i=n.direction==="rightBefore"?n.bandA:n.bandB,r=n.direction==="rightBefore"?n.bandB:n.bandA;t.bandAdjacency.push({before:i,after:r});break}case w.APPEARANCE_SPAN:t.appearanceSpan.push({player:n.player,spanLimit:n.spanLimit});break}return t}function ut(e,t){e.querySelectorAll('input[type="number"]').forEach(i=>{const r=()=>{let s=parseInt(i.value,10);(isNaN(s)||s<1)&&(s=1),s>t&&t>0&&(s=t),i.value=s};i.addEventListener("blur",r),i.addEventListener("change",r)})}function pt(e,t){if(!t.results||t.results.length===0){e.innerHTML="";return}e.innerHTML=`
    <span class="result-label">Result:</span>
    ${t.results.map((n,i)=>`
      <button type="button" class="result-pill ${i===t.selectedResultIndex?"active":""}" data-idx="${i}">
        #${i+1} cost:${n.cost}
      </button>
    `).join("")}
  `,e.querySelectorAll(".result-pill").forEach(n=>{n.addEventListener("click",()=>{const i=parseInt(n.dataset.idx,10);document.dispatchEvent(new CustomEvent("themis:selectResult",{detail:{index:i}}))})})}function mt(e,t,n,i,r=!1){const s=t.schedule;if(!s||s.length===0){const v=t.rules?t.rules.length:0;e.innerHTML=`
      <div class="error-box">
        <div style="font-weight:600;margin-bottom:0.4rem">解が見つかりません</div>
        <div>現在のルール（${v}件）の組み合わせを満たすタイムテーブルが存在しません。</div>
        <div style="margin-top:0.5rem;font-size:0.78rem;color:var(--text-1)">
          左パネルの「ルール」を開き、条件を緩和するか一部を削除してください。<br>
          特に「連続出演制限」「出演スパン制限」「隣接指定」は制約が強くなりやすいルールです。
        </div>
      </div>`;return}const u=t.bands,a=me(t.breaks),d=bt(s,t.breaks,t.timing),m=t.timing.minUnit||5;let L="";d.forEach((v,o)=>{const E=u[v.bandIndex];if(o>0&&u[d[o-1].bandIndex],o>0){const P=v.cost||0,k=P<=1?"cost-low":P<=2?"cost-med":"cost-high";L+=`
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
        `)}const N=E.members.map((P,k)=>{if(P==="n/a")return"";const S=n(P);return`<span class="member-dot" style="color:${S};background:${S}15">${q(P)}<span class="part-label">${oe[k]}</span></span>`}).filter(Boolean).join("");L+=`
      <div class="band-card" style="${r?"":`animation: fadeSlide 0.25s ease-out ${o*.04}s both`}">
        <div class="band-card-inner">
          <div class="band-order">${o+1}</div>
          <div class="band-main">
            <div class="band-name">${q(v.name)}</div>
            <div class="band-members">${N}</div>
          </div>
          <div class="band-time-col">
            <span class="band-time">${v.startTime}〜${v.endTime}</span>
            <span class="band-duration">${v.perfTime}min</span>
          </div>
        </div>
      </div>
    `,o<d.length-1&&!a.has(o)&&(L+=`
        <div class="add-break-zone">
          <button type="button" class="add-break-btn" data-after="${o}">+ 休憩を挿入</button>
        </div>
      `)}),e.innerHTML=L,e.querySelectorAll(".break-remove-btn").forEach(v=>{v.addEventListener("click",()=>{const o=parseInt(v.dataset.after,10);t.breaks=t.breaks.filter(E=>E.afterIndex!==o),V("breaks",t.breaks),i(!0)})}),e.querySelectorAll(".add-break-btn").forEach(v=>{v.addEventListener("click",()=>{const o=parseInt(v.dataset.after,10);De(v,o,m,t,i)})})}function De(e,t,n,i,r){const s=e.parentElement;s.style.opacity="1",s.innerHTML=`
    <div class="break-input-inline">
      <span class="p-help">休憩（${n}分単位）</span>
      <input type="number" class="p-input" min="${n}" step="${n}" value="${n}" style="width:55px;text-align:center;font-family:var(--font-mono);font-size:0.75rem" />
      <button type="button" class="p-btn p-btn-accent p-btn-sm">OK</button>
      <button type="button" class="p-btn p-btn-sm cancel-break">✕</button>
    </div>
  `;const u=s.querySelector("input"),a=s.querySelector(".p-btn-accent"),d=s.querySelector(".cancel-break");u.focus(),a.addEventListener("click",()=>{const m=parseInt(u.value,10);if(!m||m<n||m%n!==0){u.style.borderColor="var(--red)";return}i.breaks.push({afterIndex:t,duration:m}),i.breaks.sort((L,v)=>L.afterIndex-v.afterIndex),V("breaks",i.breaks),r(!0)}),d.addEventListener("click",()=>{s.style.opacity="",s.innerHTML=`<button type="button" class="add-break-btn" data-after="${t}">+ 休憩を挿入</button>`,s.querySelector(".add-break-btn").addEventListener("click",()=>{De(s.querySelector(".add-break-btn"),t,n,i,r)})}),u.addEventListener("keydown",m=>{m.key==="Enter"&&a.click(),m.key==="Escape"&&d.click()})}function ft(e,t,n,i,r){const s=[];let u=pe(r);for(let a=0;a<e.length;a++){const d=e[a],L=t[d.bandIndex].estimatedTime,v=u,o=v+L+i,E=Math.ceil(o/n)*n;s.push({name:d.name,bandIndex:d.bandIndex,cost:d.cost,startTime:ae(v),endTime:ae(E),startMinutes:v,endMinutes:E,perfTime:L}),u=E}return s}function bt(e,t,n){const i=n.minUnit||5,r=n.transitionTime||5;let s=pe(n.startTime||"12:00");const u=new Map;for(const d of t)u.set(d.afterIndex,d.duration);const a=[];for(let d=0;d<e.length;d++){const m=e[d],L=s,v=L+m.perfTime+r,o=Math.ceil(v/i)*i;a.push({...m,startTime:ae(L),endTime:ae(o),startMinutes:L,endMinutes:o}),s=o;const E=u.get(d);E!==void 0&&(s+=E)}return a}function He(e,t,n){const i=t.bands,r=t.schedule,s=t.results;if(!s||!r||r.length===0){e.innerHTML=`
      <div class="right-placeholder">
        最適化を実行すると<br>統計情報が表示されます
      </div>
    `;return}const u=s[t.selectedResultIndex],a=u?u.cost:0,d=me(t.breaks),m=t.timing,L=r[0].startTime;let v=r[r.length-1].endMinutes,o=0;for(const y of t.breaks)o+=y.duration;v=r[0].startMinutes;for(let y=0;y<r.length;y++){const R=r[y].perfTime,A=m.transitionTime||5,X=m.minUnit||5,ee=v+R+A;v=Math.ceil(ee/X)*X,d.has(y)&&(v+=d.get(y))}const E=ae(v),N=v-pe(L),P=Math.floor(N/60),k=N%60,S=P>0?`${P}:${String(k).padStart(2,"0")}`:`${k}`,g=r.length-1,C=g>0?(a/g).toFixed(1):"0",z=t.players,f=r.map(y=>y.bandIndex),x={};z.forEach(y=>{x[y]=0});for(const y of f){const R=i[y];if(R)for(const A of R.members)A!=="n/a"&&x[A]!==void 0&&x[A]++}const b=[...z].filter(y=>x[y]>0).sort((y,R)=>x[R]-x[y]),T=b.slice(0,12).map(y=>{const R=Le(z,y),A=f.map(X=>{const ee=i[X];return`<div class="member-pip" style="background:${ee&&ee.members.includes(y)?R:"var(--bg-3)"}"></div>`}).join("");return`
      <div class="member-row" data-member="${q(y)}">
        <span class="member-name" style="color:${R}">${q(y)}</span>
        <div class="member-pips">${A}</div>
        <span class="member-count">${x[y]}×</span>
      </div>
    `}).join(""),c=vt(f,i,z);e.innerHTML=`
    <div class="stat-block">
      <div class="stat-label">total cost</div>
      <div class="stat-value">${a}<span class="unit">pts</span></div>
      <div class="stat-sub">#${t.selectedResultIndex+1} of ${s.length} results</div>
    </div>

    <div class="stat-block">
      <div class="stat-label">duration</div>
      <div class="stat-value">${S}<span class="unit">${P>0?"hrs":"min"}</span></div>
      <div class="stat-sub">${L} → ${E}${o>0?` (休憩${o}分含む)`:""}</div>
    </div>

    <div class="stat-block">
      <div class="stat-label">transitions</div>
      <div class="stat-value">${g}</div>
      <div class="stat-sub">avg ${C} cost / transition</div>
    </div>

    <div class="member-section">
      <div class="member-section-title">
        出演メンバー
        <span style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-3)">${b.length} players</span>
      </div>
      ${T}
    </div>

    <div class="arc-section" style="position:relative">
      <div class="arc-title">Member Flow <span style="font-size:0.55rem;color:var(--text-3);font-weight:400;margin-left:0.3rem">hover to explore</span></div>
      <svg class="arc-svg" id="arc-svg" viewBox="0 0 240 130">${c}</svg>
      <div class="arc-tooltip" id="arc-tooltip"></div>
    </div>

    <div class="export-section">
      <button type="button" class="export-btn" id="export-img-btn">画像として保存</button>
      <div class="export-hint">タイムテーブルをPNG画像でダウンロード</div>
      <button type="button" class="export-btn" id="export-btn" style="margin-top:0.5rem;background:var(--bg-3);color:var(--text-1);border:1px solid var(--border)">クリップボードにコピー</button>
      <div class="export-hint">タブ区切りテキストとしてコピー</div>
    </div>
  `;const M=e.querySelector("#export-btn");M.addEventListener("click",()=>{const y=Et(r,t.breaks,i);navigator.clipboard.writeText(y).then(()=>{M.textContent="✓ コピーしました",M.classList.add("copied"),setTimeout(()=>{M.textContent="クリップボードにコピー",M.classList.remove("copied")},2e3)})}),e.querySelector("#export-img-btn").addEventListener("click",()=>{yt(r,t.breaks,i,t.timing)});const U=e.querySelector("#arc-svg"),O=e.querySelector("#arc-tooltip");U&&O&&(U.querySelectorAll(".arc-path").forEach(y=>{y.addEventListener("mouseenter",R=>{const A=y.dataset.member;ke(e,U,A),O.textContent=A,O.classList.add("visible")}),y.addEventListener("mousemove",R=>{const A=O.parentElement.getBoundingClientRect();O.style.left=R.clientX-A.left+8+"px",O.style.top=R.clientY-A.top-24+"px"}),y.addEventListener("mouseleave",()=>{ve(e,U),O.classList.remove("visible")})}),U.querySelectorAll(".arc-dot").forEach(y=>{y.addEventListener("mouseenter",()=>{const R=y.dataset.bandSlot;if(R!==void 0){const A=parseInt(R,10);U.classList.add("has-highlight"),U.querySelectorAll(`.arc-path[data-from="${A}"], .arc-path[data-to="${A}"]`).forEach(X=>{X.classList.add("arc-active")}),y.classList.add("arc-active")}}),y.addEventListener("mouseleave",()=>{ve(e,U)})}));let J=null;function _(y){K();const R=e.querySelector(`.member-row[data-member="${CSS.escape(y)}"]`);R&&R.classList.add("active"),U&&ke(e,U,y),ht(y,f,i)}function K(){e.querySelectorAll(".member-row.active").forEach(y=>y.classList.remove("active")),U&&ve(e,U),gt()}e.querySelectorAll(".member-row").forEach(y=>{const R=y.dataset.member;R&&(y.addEventListener("mouseenter",()=>{J||_(R)}),y.addEventListener("mouseleave",()=>{J||K()}),y.addEventListener("click",()=>{J===R?(J=null,K()):(J=R,_(R))}))})}function vt(e,t,n){const i=e.length;if(i<2)return"";const r=240,s=110,u=r/(i+1);let a="",d="",m="";e.forEach((o,E)=>{const N=u*(E+1),P=t[o],k=P?P.name.slice(0,3):String(E+1);d+=`<circle class="arc-dot" data-band-slot="${E}" cx="${N}" cy="${s}" r="4" fill="var(--gold)" opacity="0.6" style="cursor:pointer"/>`,m+=`<text class="arc-label-text" data-band-slot="${E}" x="${N}" y="${s+14}" text-anchor="middle" font-size="5.5" font-family="Outfit, Noto Sans JP, sans-serif" fill="var(--text-3)">${q(k)}</text>`});const L=[];for(let o=0;o<i;o++)for(let E=o+1;E<i;E++){const N=t[e[o]],P=t[e[E]];if(!N||!P)continue;const k=N.members.filter(g=>g!=="n/a"&&P.members.includes(g)),S=[...new Set(k)];for(const g of S)L.push({from:o,to:E,member:g,consecutive:E===o+1})}L.sort((o,E)=>o.consecutive!==E.consecutive?o.consecutive?-1:1:o.to-o.from-(E.to-E.from));const v={};for(const o of L){const E=u*(o.from+1),N=u*(o.to+1),P=o.to-o.from,k=`${o.from}-${o.to}`,S=v[k]||0;v[k]=S+1;const C=(o.consecutive?16:22+P*6)+S*10,z=Math.min(C,s-8),f=Le(n,o.member),x=o.consecutive?.5:.2,b=o.consecutive?1.5:1,T=o.consecutive?"":'stroke-dasharray="3,2"';a+=`<path class="arc-path" data-member="${q(o.member)}" data-from="${o.from}" data-to="${o.to}" d="M${E},${s} Q${(E+N)/2},${s-z} ${N},${s}" fill="none" stroke="${f}" stroke-width="${b}" opacity="${x}" ${T} style="cursor:pointer"/>`}return a+d+m}function ke(e,t,n){t.classList.add("has-highlight"),t.querySelectorAll(`.arc-path[data-member="${CSS.escape(n)}"]`).forEach(s=>{s.classList.add("arc-active")});const i=t.querySelectorAll(".arc-path.arc-active"),r=new Set;i.forEach(s=>{r.add(s.dataset.from),r.add(s.dataset.to)}),r.forEach(s=>{t.querySelectorAll(`[data-band-slot="${s}"]`).forEach(u=>u.classList.add("arc-active"))})}function ve(e,t){t.classList.remove("has-highlight"),t.querySelectorAll(".arc-active").forEach(n=>n.classList.remove("arc-active"))}function ht(e,t,n){const i=document.getElementById("timeline-body");if(!i)return;i.querySelectorAll(".band-card").forEach((s,u)=>{if(u>=t.length)return;const a=n[t[u]];a&&a.members.includes(e)&&(s.classList.add("member-highlight"),s.querySelectorAll(".member-dot").forEach(d=>{d.textContent.includes(e)&&d.classList.add("member-highlight")}))})}function gt(){const e=document.getElementById("timeline-body");e&&e.querySelectorAll(".member-highlight").forEach(t=>t.classList.remove("member-highlight"))}function yt(e,t,n,i,r,s){const u=me(t),a=i.minUnit||5,d=i.transitionTime||5;let m=pe(i.startTime||"12:00");const L=[];for(let p=0;p<e.length;p++){const I=e[p],D=n[I.bandIndex],h=m,B=h+I.perfTime+d,G=Math.ceil(B/a)*a,j=D?D.members:[],H=[];for(let W=0;W<j.length;W++)j[W]!=="n/a"&&H.push({part:oe[W],name:j[W]});L.push({name:I.name,start:ae(h),end:ae(G),perfTime:I.perfTime,cost:I.cost,memberParts:H}),m=G,u.has(p)&&(L.push({isBreak:!0,duration:u.get(p)}),m+=u.get(p))}const v=2,o=32,E=28,N=56,P=28,k=52,S=36,g=110,C=160,z=260,f=o*2+g+C+z;let x=k;for(const p of L)x+=p.isBreak?P:N;x+=S;const b=E*2+x,T=document.createElement("canvas");T.width=f*v,T.height=b*v;const c=T.getContext("2d");c.scale(v,v);const M=getComputedStyle(document.documentElement),F=M.getPropertyValue("--bg-0").trim()||"#08090c",U=M.getPropertyValue("--bg-2").trim()||"#14161d",O=M.getPropertyValue("--bg-3").trim()||"#1a1d27",J=M.getPropertyValue("--text-0").trim()||"#eae8e3",_=M.getPropertyValue("--text-1").trim()||"#b0ada5",K=M.getPropertyValue("--text-2").trim()||"#706d65",y=M.getPropertyValue("--gold").trim()||"#d4a843",R=M.getPropertyValue("--border").trim()||"#1e2130";M.getPropertyValue("--green").trim(),M.getPropertyValue("--red").trim(),c.fillStyle=F,c.fillRect(0,0,f,b);let A=E;const X=L.find(p=>!p.isBreak)?.start||"--:--",ee=L.filter(p=>!p.isBreak).pop()?.end||"--:--";c.fillStyle=J,c.font="600 14px Outfit, Noto Sans JP, sans-serif",c.fillText("タイムテーブル",o,A+20),c.fillStyle=_,c.font="500 10px JetBrains Mono, monospace",c.textAlign="right",c.fillText(`${X} → ${ee}`,f-o,A+20),c.textAlign="left",A+=k,c.fillStyle=O,c.fillRect(o,A-4,f-o*2,22),c.fillStyle=K,c.font="500 8.5px JetBrains Mono, monospace",c.fillText("TIME",o+8,A+10),c.fillText("BAND",o+g+8,A+10),c.fillText("MEMBERS",o+g+C+8,A+10),A+=22;for(let p=0;p<L.length;p++){const I=L[p];if(I.isBreak){c.fillStyle=O,c.fillRect(o,A,f-o*2,P),c.strokeStyle=y,c.lineWidth=2,c.beginPath(),c.moveTo(o,A),c.lineTo(o,A+P),c.stroke(),c.fillStyle=y,c.font="500 10px Outfit, Noto Sans JP, sans-serif",c.fillText(`休憩 ${I.duration}分`,o+12,A+P/2+4),A+=P;continue}const D=L.slice(0,p).filter(W=>!W.isBreak).length;c.fillStyle=D%2===0?U:F,c.fillRect(o,A,f-o*2,N),c.strokeStyle=R,c.lineWidth=.5,c.beginPath(),c.moveTo(o,A+N),c.lineTo(f-o,A+N),c.stroke(),c.fillStyle=y,c.font="600 11px JetBrains Mono, monospace",c.fillText(`${I.start}`,o+8,A+18),c.fillStyle=K,c.font="400 9px JetBrains Mono, monospace",c.fillText(`〜${I.end}`,o+8,A+32),c.fillStyle=J,c.font="600 12px Outfit, Noto Sans JP, sans-serif",c.fillText(I.name,o+g+8,A+18),c.fillStyle=K,c.font="400 8px JetBrains Mono, monospace",c.fillText(`${I.perfTime}min`,o+g+8,A+32);const h=o+g+C+8,B=z-16,G=Math.ceil(I.memberParts.length/2),j=I.memberParts.slice(0,G),H=I.memberParts.slice(G);[j,H].forEach((W,Y)=>{let Z=h;const ne=A+18+Y*16;for(const de of W){c.fillStyle=K,c.font="400 7px JetBrains Mono, monospace",c.fillText(de.part,Z,ne);const Ae=c.measureText(de.part).width+2;if(c.fillStyle=_,c.font="400 9px Outfit, Noto Sans JP, sans-serif",c.fillText(de.name,Z+Ae,ne),Z+=Ae+c.measureText(de.name).width+10,Z>h+B)break}}),A+=N}A+=8,c.fillStyle=K,c.font="400 8px JetBrains Mono, monospace",c.fillText(new Date().toLocaleDateString("ja-JP"),o,A+12);const fe=T.toDataURL("image/png"),l=document.createElement("a");l.href=fe,l.download="timetable.png",l.style.display="none",document.body.appendChild(l),l.click(),setTimeout(()=>document.body.removeChild(l),500)}function Et(e,t,n){const i=me(t),r=[];for(let s=0;s<e.length;s++){const u=e[s],a=n&&n[u.bandIndex],d=a?a.members.join("	"):"";r.push(`${u.startTime}〜${u.endTime}	${u.name}	${d}	${u.perfTime}分`);const m=i.get(s);m!==void 0&&r.push(`	休憩 (${m}分)`)}return r.join(`
`)}const Lt=Re(),je=document.getElementById("theme-switcher");function Ue(e){je.querySelectorAll(".theme-btn").forEach(t=>{t.classList.toggle("active",t.dataset.theme===e)})}Ue(Lt);je.addEventListener("click",e=>{const t=e.target.closest(".theme-btn");if(!t)return;const n=Je(t.dataset.theme);Ue(n),$.results&&He(We,$)});const Ge=document.getElementById("left-panel");document.getElementById("center-panel");const We=document.getElementById("right-panel"),Me=document.getElementById("empty-state"),we=document.getElementById("timeline-container"),he=document.getElementById("timeline-body"),ge=document.getElementById("timeline-controls"),ue=document.getElementById("optimize-bar"),Pe=document.getElementById("optimize-status"),te=document.getElementById("optimize-btn"),$={players:Q("players",[]),bands:Q("bands",[]),costWeights:Q("costWeights",[0,1,1,1,0,1]),rules:Q("rules",[]),distinguishGuitar:Q("distinguishGuitar",!0),timing:Q("timing",{minUnit:5,transitionTime:5,startTime:"12:00"}),results:null,selectedResultIndex:0,schedule:null,breaks:Q("breaks",[])};function ze(e){return Le($.players,e)}function $t(){le(),ce(),document.dispatchEvent(new CustomEvent("themis:dataChanged"))}function xt(){$.results=null,$.schedule=null,$.selectedResultIndex=0,Te(),le(),ce()}function $e(){le(),ce()}function Tt(e=!1){$.schedule&&(le(e),ce())}function At(){const e=$.bands;if(e.length<2){ye("warn","バンドが足りません","最適化するには最低2つのバンドを登録してください。");return}const t=dt($.rules);te.textContent="最適化中...",te.disabled=!0,setTimeout(()=>{try{const n=Oe(e,{distinguishGuitar:$.distinguishGuitar,freeLeave:!1,costWeights:$.costWeights,constraints:t},8);$.results=n,$.selectedResultIndex=0,$.breaks=[],V("breaks",[]),n.length>0?$.schedule=xe(n[0]):($.schedule=null,ye("error","解が見つかりません","設定されたルールの組み合わせを満たすタイムテーブルが存在しません。ルールを緩和するか、一部のルールを削除してください。",1e4)),$e()}catch(n){const i=St(n.message);ye("error",i.title,i.body)}finally{te.textContent="最適化を実行",te.disabled=!1}},16)}function St(e){if(e.includes("Too many bands")){const t=e.match(/\((\d+)\)/);return{title:"バンド数が多すぎます",body:`現在${t?t[1]:"?"}バンドが登録されていますが、最適化できるのは最大20バンドまでです。バンド数を減らすか、不要なデータを削除してください。`}}return{title:"最適化エラー",body:e}}te.addEventListener("click",At);function xe(e){const t=tt($.bands,e.path,$.distinguishGuitar,!1,$.costWeights);return ft(t,$.bands,$.timing.minUnit,$.timing.transitionTime,$.timing.startTime)}function It(e){!$.results||e>=$.results.length||($.selectedResultIndex=e,$.schedule=xe($.results[e]),$.breaks=$.breaks.filter(t=>t.afterIndex<$.schedule.length-1),V("breaks",$.breaks),$e())}function kt(){if(!$.results)return;const e=$.results[$.selectedResultIndex];e&&($.schedule=xe(e),$e())}function Te(){const e=$.bands;if(e.length<2){ue.classList.add("hidden");return}ue.classList.remove("hidden");const t=$.rules.length,n=$._ruleWarnings||[];n.length>0?(ue.classList.add("has-warnings"),Pe.innerHTML=`<span class="opt-warn">⚠ ${n.length}件の問題があります</span>`,te.disabled=!0,te.title=n[0]):(ue.classList.remove("has-warnings"),Pe.innerHTML=`<span class="check">✓</span> ${e.length} bands · ${t} rules`,te.disabled=!1,te.title="")}function le(e=!1){const t=$.bands;if(t.length===0){Me.classList.remove("hidden"),we.classList.add("hidden");return}Me.classList.add("hidden"),we.classList.remove("hidden"),$.results&&$.results.length>0&&$.schedule?(pt(ge,$),mt(he,$,ze,Tt,e)):t.length>=2?(ge.innerHTML="",Mt(he,t)):(ge.innerHTML="",he.innerHTML='<div style="padding:2rem;text-align:center;color:var(--text-3);font-size:0.8rem;">最低2つのバンドを登録してください。</div>')}function Mt(e,t){e.innerHTML=t.map((n,i)=>{const r=n.members.map((s,u)=>{if(s==="n/a")return"";const a=ze(s);return`<span class="member-dot" style="color:${a};background:${a}15">${q(s)}<span class="part-label">${oe[u]}</span></span>`}).filter(Boolean).join("");return`
      <div class="band-card" style="animation: fadeSlide 0.3s ease-out ${i*.04}s both">
        <div class="band-card-inner">
          <div class="band-order">${i+1}</div>
          <div class="band-main">
            <div class="band-name">${q(n.name)}</div>
            <div class="band-members">${r}</div>
          </div>
          <div class="band-time-col">
            <span class="band-duration">${n.estimatedTime}min</span>
          </div>
        </div>
      </div>
    `}).join("")}function ce(){He(We,$)}document.addEventListener("themis:selectResult",e=>{It(e.detail.index)});document.addEventListener("themis:timingChanged",()=>{kt()});document.addEventListener("themis:rulesValidated",e=>{$._ruleWarnings=e.detail.warnings,Te()});Ke(Ge,$,$t);st(Ge,$,xt);Te();le();ce();{let m=function(L,v){const o=document.getElementById(L);if(!o)return;let E,N;function P(g){g.preventDefault(),o.classList.add("dragging"),document.body.classList.add("resizing"),E=g.clientX,N=v==="left"?a:d,document.addEventListener("mousemove",k),document.addEventListener("mouseup",S)}function k(g){const C=g.clientX-E;v==="left"?(a=Math.max(t,Math.min(n,N+C)),e.style.setProperty("--left-w",a+"px")):(d=Math.max(i,Math.min(r,N-C)),e.style.setProperty("--right-w",d+"px"))}function S(){o.classList.remove("dragging"),document.body.classList.remove("resizing"),document.removeEventListener("mousemove",k),document.removeEventListener("mouseup",S),V("panelLeftW",a),V("panelRightW",d)}o.addEventListener("mousedown",P)};var wt=m;const e=document.querySelector(".layout"),t=240,n=480,i=240,r=440,s=340,u=320;let a=Q("panelLeftW",s),d=Q("panelRightW",u);a=Math.max(t,Math.min(n,a)),d=Math.max(i,Math.min(r,d)),e.style.setProperty("--left-w",a+"px"),e.style.setProperty("--right-w",d+"px"),m("resize-left","left"),m("resize-right","right")}function ye(e,t,n,i=6e3){const r=document.getElementById("toast-container"),s=document.createElement("div");s.className=`toast toast-${e}`,s.innerHTML=`
    <div class="toast-title">${q(t)}</div>
    ${n?`<div class="toast-body">${q(n)}</div>`:""}
  `,r.appendChild(s),setTimeout(()=>{s.classList.add("removing"),s.addEventListener("animationend",()=>s.remove())},i),s.addEventListener("click",()=>{s.classList.add("removing"),s.addEventListener("animationend",()=>s.remove())})}
