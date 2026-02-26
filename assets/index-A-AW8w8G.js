(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const It="themis_";function x(t,e){try{localStorage.setItem(It+t,JSON.stringify(e))}catch{}}function B(t,e=null){try{const n=localStorage.getItem(It+t);return n===null?e:JSON.parse(n)}catch{return e}}const Bt="theme",kt=["dark","light","cyber"];function Ot(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function qt(t){document.documentElement.setAttribute("data-theme",t)}function wt(){const t=B(Bt),e=kt.includes(t)?t:Ot();return qt(e),e}function Ht(t){return kt.includes(t)?(qt(t),x(Bt,t),t):wt()}function jt(t,e){const n=[],r=[],o=new Set,a=t.split(`
`).filter(i=>i.trim()!=="");for(let i=0;i<a.length;i++){const s=i+1,c=a[i].split("	");if(c.length<8){r.push({row:s,message:`${s}行目: 列数が不足しています（${c.length}列）。最低8列（バンド名、6パート、時間）が必要です。`});continue}const b=c[c.length-1].trim(),h=c[c.length-2].trim(),f=c[c.length-3].trim(),p=c[c.length-4].trim(),v=c[c.length-5].trim(),y=c[c.length-6].trim(),T=c[c.length-7].trim(),E=c.slice(0,c.length-7).join("	").trim();if(!E){r.push({row:s,message:`${s}行目: バンド名が空です。`});continue}const m=[{label:"Vo.",value:T},{label:"L.Gt",value:y},{label:"B.Gt",value:v},{label:"Ba.",value:p},{label:"Dr.",value:f},{label:"Key.",value:h}];let g=!1;for(const L of m)L.value.includes(" ")&&(r.push({row:s,message:`${s}行目: ${L.label}のセル「${L.value}」にスペースが含まれています。セル内にスペースは使用できません。`}),g=!0);if(g)continue;const I=Gt(b,s);if(I.error){r.push(I.error);continue}const P=[T,y,v,p,f,h];for(const L of P)L&&L!==e&&o.add(L);n.push({name:E,members:P,estimatedTime:I.value})}return{bands:n,errors:r,players:Array.from(o).sort()}}function Gt(t,e){const n=t.trim();if(!n)return{error:{row:e,message:`${e}行目: 演奏時間が空です。`}};if(/\d+\D+\d+/.test(n))return{error:{row:e,message:`${e}行目: 演奏時間「${n}」が曖昧です。数字が複数含まれているため、どの数字を使用すべきか判断できません。数字のみで入力してください（例: 「5」）。`}};const r=n.replace(/\D/g,"");if(!r)return{error:{row:e,message:`${e}行目: 演奏時間「${n}」に数字が含まれていません。`}};const o=parseInt(r,10);return o<=0?{error:{row:e,message:`${e}行目: 演奏時間は1分以上にしてください。`}}:{value:o}}const O="players",Y="bands",ht="emptyIndicator",vt="entryMode",yt=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],Pt=["vocal","leadGuitar","backingGuitar","bass","drums","keyboard"];function Ut(t,e={}){const{onProceed:n}=e,r=B(O,[]),o=B(Y,[]),a=B(ht,"n/a"),i=B(vt,"manual");t.innerHTML=Yt(a,i);let s=r,u=o;t.querySelector("#tab-manual"),t.querySelector("#tab-paste"),Kt(t,m=>{x(vt,m)});const c=t.querySelector("#player-tag-input"),b=t.querySelector("#player-chips");H(b,s),c.addEventListener("keydown",m=>{if(m.key==="Enter"){m.preventDefault();const g=c.value.trim();g&&!s.includes(g)&&(s.push(g),x(O,s),H(b,s),j(t,s)),c.value=""}}),b.addEventListener("click",m=>{const g=m.target.closest(".chip-delete");if(!g)return;const I=g.dataset.name;s=s.filter(P=>P!==I),x(O,s),H(b,s),j(t,s)});const h=t.querySelector("#band-form"),f=t.querySelector("#band-table-body");K(f,u,s,t),j(t,s),h.addEventListener("submit",m=>{m.preventDefault();const g=Vt(h);g&&(u.push(g),x(Y,u),K(f,u,s,t),h.reset())});const p=t.querySelector("#paste-btn"),v=t.querySelector("#paste-input"),y=t.querySelector("#empty-indicator"),T=t.querySelector("#paste-errors");y.value=a,y.addEventListener("input",()=>{x(ht,y.value.trim()||"n/a")}),p.addEventListener("click",()=>{const m=v.value.trim();if(!m){St(T,[{row:0,message:"テキストが入力されていません。"}]);return}const g=y.value.trim()||"n/a",I=jt(m,g);if(I.errors.length>0){St(T,I.errors);return}const P=new Set(s);let L=!1;for(const D of I.players)P.has(D)||(s.push(D),P.add(D),L=!0);L&&(x(O,s),H(b,s),j(t,s));for(const D of I.bands)u.push(D);x(Y,u),K(f,u,s,t),v.value="",T.innerHTML="",Wt(T,I.bands.length,I.players.length)});const k=t.querySelector("#clear-all-btn"),E=k.closest(".actions-bar");if(k.addEventListener("click",()=>{k.style.display="none";const m=document.createElement("div");m.className="clear-confirm-bar",m.innerHTML=`
      <span class="clear-confirm-text">全てのデータを削除しますか？</span>
      <button type="button" class="btn btn-danger btn-confirm-yes">削除する</button>
      <button type="button" class="btn btn-secondary btn-confirm-no">キャンセル</button>
    `,E.insertBefore(m,k),m.querySelector(".btn-confirm-yes").addEventListener("click",()=>{s=[],u=[],c.value="",x(O,s),x(Y,u),H(b,s),K(f,u,s,t),j(t,s),m.remove(),k.style.display=""}),m.querySelector(".btn-confirm-no").addEventListener("click",()=>{m.remove(),k.style.display=""})}),n){const m=t.querySelector("#proceed-btn");m&&m.addEventListener("click",n)}}function Yt(t,e){const n=e!=="paste";return`
    <section class="section" id="section-players">
      <h2 class="section-title">Step 1: データ入力</h2>

      <div class="subsection">
        <h3 class="subsection-title">入力方法</h3>
        <div class="tab-bar">
          <button type="button" class="tab-btn ${n?"active":""}" data-tab="manual">手動入力</button>
          <button type="button" class="tab-btn ${n?"":"active"}" data-tab="paste">スプレッドシート貼り付け</button>
        </div>

        <div class="tab-content ${n?"":"hidden"}" id="tab-manual">
          <div class="subsection">
            <h3 class="subsection-title">参加メンバー</h3>
            <p class="subsection-desc">名前を入力して Enter で追加してください。</p>
            <div class="tag-input-wrap">
              <div id="player-chips" class="tag-input-chips"></div>
              <input type="text" id="player-tag-input" class="tag-input" placeholder="メンバー名を入力..." />
            </div>
          </div>

          <div class="subsection">
            <h3 class="subsection-title">バンド登録</h3>
            <form id="band-form" class="band-form">
              <div class="form-row">
                <label class="form-label">
                  バンド名
                  <input type="text" id="band-name" class="form-input" required placeholder="バンド名を入力" />
                </label>
                <label class="form-label form-label-short">
                  演奏時間（分）
                  <input type="number" id="band-time" class="form-input" required min="1" placeholder="5" />
                </label>
              </div>
              <div class="form-row form-parts-row">
                ${yt.map((r,o)=>`
                  <label class="form-label form-label-part">
                    ${r}
                    <select id="part-${Pt[o]}" class="form-select part-dropdown">
                      <option value="n/a">— 空き —</option>
                    </select>
                  </label>
                `).join("")}
              </div>
              <button type="submit" class="btn btn-primary">バンドを追加</button>
            </form>
          </div>
        </div>

        <div class="tab-content ${n?"hidden":""}" id="tab-paste">
          <div class="paste-config">
            <label class="form-label">
              空きスロットの表記
              <input type="text" id="empty-indicator" class="form-input form-input-short" value="${R(t)}" placeholder="n/a" />
            </label>
            <p class="subsection-desc">
              スプレッドシートからコピーしたデータを貼り付けてください。<br>
              各セルはタブ区切りで、順序は: バンド名 / Vo. / L.Gt / B.Gt / Ba. / Dr. / Key. / 時間<br>
              <strong>バンド名以外のセルにスペースを含めないでください。</strong><br>
              メンバー名は自動的に検出されます。<br>
              ※ 時間の数値はすべて「分」として扱われます。
            </p>
          </div>
          <textarea id="paste-input" class="input-textarea input-textarea-paste" rows="8" placeholder="King Gnu	井口	常田	n/a	新井	勢喜	井口	20分"></textarea>
          <button type="button" id="paste-btn" class="btn btn-primary">取り込む</button>
          <div id="paste-errors"></div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">登録済みバンド</h3>
        <div class="band-table-wrap">
          <table class="band-table">
            <thead>
              <tr>
                <th>#</th>
                <th>バンド名</th>
                ${yt.map(r=>`<th>${r}</th>`).join("")}
                <th>時間</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="band-table-body">
            </tbody>
          </table>
        </div>
        <p id="band-count" class="subsection-desc"></p>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="clear-all-btn" class="btn btn-danger">全データ削除</button>
        <button type="button" id="proceed-btn" class="btn btn-accent">→ 条件設定へ (Step 2)</button>
      </div>
    </section>
  `}function H(t,e){if(e.length===0){t.innerHTML="";return}t.innerHTML=e.map(n=>`<span class="chip chip-removable">${R(n)}<button type="button" class="chip-delete" data-name="${R(n)}" title="削除">✕</button></span>`).join("")}function j(t,e){t.querySelectorAll(".part-dropdown").forEach(r=>{const o=r.value;r.innerHTML='<option value="n/a">— 空き —</option>';for(const a of e){const i=document.createElement("option");i.value=a,i.textContent=a,a===o&&(i.selected=!0),r.appendChild(i)}})}function K(t,e,n,r){e.length===0?t.innerHTML='<tr><td colspan="10" class="text-muted text-center">バンドが登録されていません</td></tr>':(t.innerHTML=e.map((a,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${R(a.name)}</td>
        ${a.members.map(s=>`<td>${R(s)}</td>`).join("")}
        <td>${a.estimatedTime}分</td>
        <td><button type="button" class="btn-icon btn-delete" data-index="${i}" title="削除">✕</button></td>
      </tr>
    `).join(""),t.querySelectorAll(".btn-delete").forEach(a=>{a.addEventListener("click",()=>{const i=parseInt(a.dataset.index,10);e.splice(i,1),x(Y,e),K(t,e,n,r)})}));const o=r.querySelector("#band-count");o&&(o.textContent=e.length>0?`${e.length}バンド登録済み`:"")}function Kt(t,e){t.querySelectorAll(".tab-btn").forEach(r=>{const o=r.cloneNode(!0);r.parentNode.replaceChild(o,r),o.addEventListener("click",()=>{const a=o.dataset.tab;t.querySelectorAll(".tab-btn").forEach(i=>i.classList.remove("active")),o.classList.add("active"),t.querySelector("#tab-manual").classList.toggle("hidden",a!=="manual"),t.querySelector("#tab-paste").classList.toggle("hidden",a!=="paste"),e&&e(a)})})}function Vt(t){const e=t.querySelector("#band-name").value.trim(),n=parseInt(t.querySelector("#band-time").value,10);if(!e||!n||n<=0)return null;const r=Pt.map(o=>{const a=t.querySelector(`#part-${o}`);return a?a.value:"n/a"});return{name:e,members:r,estimatedTime:n}}function St(t,e){t.innerHTML=`
    <div class="paste-error-box">
      ${e.map(n=>`<p class="error-line">${R(n.message)}</p>`).join("")}
    </div>
  `}function Wt(t,e,n){t.innerHTML=`
    <div class="paste-success-box">
      <p>${e}バンドを取り込みました。${n>0?`${n}人の新しいメンバーを追加しました。`:""}</p>
    </div>
  `}function R(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const Et="costWeights",X="rules",Xt=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],tt=[0,1,1,1,0,1],$={BAND_POSITION:"bandPosition",BAND_ORDER:"bandOrder",PLAYER_APPEARANCE:"playerAppearance"};function Jt(t,e,n,r){const o=B(Et,[...tt]),a=B(X,[]);let i=o.length===6?o:[...tt],s=a;t.innerHTML=zt(i),t.querySelector("#back-to-step1").addEventListener("click",r),t.querySelectorAll(".cost-weight-input").forEach((E,m)=>{E.addEventListener("input",()=>{const g=parseInt(E.value,10);i[m]=isNaN(g)?tt[m]:Math.max(0,Math.min(3,g)),E.value=i[m],x(Et,i)})});const c=t.querySelector("#rule-type"),b=t.querySelector("#add-rule-btn"),h=t.querySelector("#rules-list"),f=t.querySelector("#rule-config");c.addEventListener("change",()=>{et(f,c.value,n,e),nt(f,n.length)}),et(f,c.value,n,e),nt(f,n.length);function p(){x(X,s)}function v(E){const m=s[E];s.splice(E,1),x(X,s),c.value=m.type,et(f,m.type,n,e),nt(f,n.length),Qt(f,m),y()}function y(){Dt(h,s,n,e,p,v)}let T=t.querySelector("#rule-error");T||(T=document.createElement("p"),T.id="rule-error",T.className="rule-error-msg",b.parentNode.insertBefore(T,b.nextSibling)),b.addEventListener("click",()=>{T.textContent="";const E=Zt(f,c.value,n);if(E&&E.error){T.textContent=E.error;return}E&&(s.push(E),x(X,s),y())}),y(),t.querySelector("#proceed-to-generate").addEventListener("click",()=>{const E=new CustomEvent("themis:generate",{detail:{costWeights:i,rules:s}});document.dispatchEvent(E)})}function zt(t,e,n){return`
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-to-step1" class="btn btn-secondary">← Step 1 に戻る</button>
        <h2 class="section-title section-title-inline">Step 2: 条件設定</h2>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">転換コスト（楽器別）</h3>
        <p class="subsection-desc">
          各楽器の転換コスト（0〜3）を設定してください。<br>
          デフォルト: Vo.=0, Dr.=0（変更コスト無し）、その他=1
        </p>
        <div class="cost-grid">
          ${Xt.map((r,o)=>`
            <div class="cost-item">
              <label class="cost-label">${r}</label>
              <input type="number" class="form-input cost-weight-input" min="0" max="3" value="${t[o]}" />
            </div>
          `).join("")}
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">ルール</h3>
        <p class="subsection-desc">
          条件を追加しない場合、全楽器コスト1（Vo.除く）のデフォルト設定で最適化されます。
        </p>

        <div class="rule-builder">
          <div class="form-row">
            <label class="form-label">
              ルール種類
              <select id="rule-type" class="form-select">
                <option value="${$.BAND_POSITION}">バンドの配置指定</option>
                <option value="${$.BAND_ORDER}">バンドの順序指定</option>
                <option value="${$.PLAYER_APPEARANCE}">メンバーの出演位置</option>
              </select>
            </label>
          </div>
          <div id="rule-config" class="rule-config-area"></div>
          <button type="button" id="add-rule-btn" class="btn btn-primary">ルールを追加</button>
        </div>

        <div id="rules-list" class="rules-list"></div>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="proceed-to-generate" class="btn btn-accent">→ タイムテーブル生成</button>
      </div>
    </section>
  `}function et(t,e,n,r){switch(e){case $.BAND_POSITION:t.innerHTML=`
        <div class="form-row">
          <label class="form-label">
            バンド
            <select id="rc-band" class="form-select">
              ${n.map((o,a)=>`<option value="${a}">${w(o.name)}</option>`).join("")}
            </select>
          </label>
          <label class="form-label">
            条件
            <select id="rc-pos-mode" class="form-select">
              <option value="exactly">ちょうどX番目</option>
              <option value="before">X番目以内</option>
              <option value="after">X番目以後</option>
            </select>
          </label>
          <label class="form-label form-label-short">
            位置（番号）
            <input type="number" id="rc-position" class="form-input" min="1" max="${n.length}" value="1" />
          </label>
        </div>
      `;break;case $.BAND_ORDER:t.innerHTML=`
        <div class="form-row">
          <label class="form-label">
            バンドA（先に演奏）
            <select id="rc-band-before" class="form-select">
              ${n.map((o,a)=>`<option value="${a}">${w(o.name)}</option>`).join("")}
            </select>
          </label>
          <label class="form-label form-label-mid">の後に</label>
          <label class="form-label">
            バンドB（後に演奏）
            <select id="rc-band-after" class="form-select">
              ${n.map((o,a)=>`<option value="${a}">${w(o.name)}</option>`).join("")}
            </select>
          </label>
        </div>
      `;break;case $.PLAYER_APPEARANCE:t.innerHTML=`
        <div class="form-row">
          <label class="form-label">
            メンバー
            <select id="rc-player" class="form-select">
              ${r.map(o=>`<option value="${w(o)}">${w(o)}</option>`).join("")}
            </select>
          </label>
          <label class="form-label">
            条件
            <select id="rc-appear-mode" class="form-select">
              <option value="before">全出演をX番目以前に</option>
              <option value="after">全出演をX番目以降に</option>
            </select>
          </label>
          <label class="form-label form-label-short">
            位置
            <input type="number" id="rc-appear-pos" class="form-input" min="1" max="${n.length}" value="1" />
          </label>
        </div>
      `;break}}function Qt(t,e){switch(e.type){case $.BAND_POSITION:{const n=t.querySelector("#rc-band"),r=t.querySelector("#rc-pos-mode"),o=t.querySelector("#rc-position");n&&(n.value=String(e.bandIndex)),r&&(r.value=e.mode),o&&(o.value=e.position);break}case $.BAND_ORDER:{const n=t.querySelector("#rc-band-before"),r=t.querySelector("#rc-band-after");n&&(n.value=String(e.before)),r&&(r.value=String(e.after));break}case $.PLAYER_APPEARANCE:{const n=t.querySelector("#rc-player"),r=t.querySelector("#rc-appear-mode"),o=t.querySelector("#rc-appear-pos");n&&(n.value=e.player),r&&(r.value=e.mode),o&&(o.value=e.position);break}}}function Zt(t,e,n,r){switch(e){case $.BAND_POSITION:{const o=parseInt(t.querySelector("#rc-band").value,10),a=t.querySelector("#rc-pos-mode").value,i=parseInt(t.querySelector("#rc-position").value,10);return isNaN(o)||isNaN(i)||i<1?null:{type:$.BAND_POSITION,bandIndex:o,bandName:n[o]?.name||"",mode:a,position:i}}case $.BAND_ORDER:{const o=parseInt(t.querySelector("#rc-band-before").value,10),a=parseInt(t.querySelector("#rc-band-after").value,10);return isNaN(o)||isNaN(a)?null:o===a?{error:"同じバンドを指定することはできません。"}:{type:$.BAND_ORDER,before:o,after:a,beforeName:n[o]?.name||"",afterName:n[a]?.name||""}}case $.PLAYER_APPEARANCE:{const o=t.querySelector("#rc-player").value,a=t.querySelector("#rc-appear-mode").value,i=parseInt(t.querySelector("#rc-appear-pos").value,10);return!o||isNaN(i)||i<1?null:{type:$.PLAYER_APPEARANCE,player:o,mode:a,position:i}}}return null}function Dt(t,e,n,r,o,a){if(e.length===0){t.innerHTML='<p class="text-muted">ルールが設定されていません。デフォルト設定で最適化されます。</p>';return}t.innerHTML=e.map((i,s)=>`
      <div class="rule-item" data-index="${s}">
        <span class="rule-text">${te(i)}</span>
        <span class="rule-edit-hint">クリックで編集</span>
        <button type="button" class="btn-icon btn-delete-rule" data-index="${s}" title="削除">✕</button>
      </div>
    `).join(""),t.querySelectorAll(".btn-delete-rule").forEach(i=>{i.addEventListener("click",s=>{s.stopPropagation();const u=parseInt(i.dataset.index,10);e.splice(u,1),o(),Dt(t,e,n,r,o,a)})}),a&&t.querySelectorAll(".rule-item").forEach(i=>{i.addEventListener("click",s=>{if(s.target.closest(".btn-delete-rule"))return;const u=parseInt(i.dataset.index,10);a(u)})})}function te(t){switch(t.type){case $.BAND_POSITION:return t.mode==="exactly"?`「${w(t.bandName)}」を ${t.position}番目に固定`:t.mode==="after"?`「${w(t.bandName)}」を ${t.position}番目以後に配置`:`「${w(t.bandName)}」を ${t.position}番目以内に配置`;case $.BAND_ORDER:return`「${w(t.beforeName)}」を「${w(t.afterName)}」より前に配置`;case $.PLAYER_APPEARANCE:return t.mode==="before"?`${w(t.player)} の全出演を ${t.position}番目以前に`:`${w(t.player)} の全出演を ${t.position}番目以降に`;default:return"不明なルール"}}function ee(t){const e={fixedLast:null,rules:[],fixedPositions:[],bandOrdering:[],playerAppearance:[]};for(const n of t)switch(n.type){case $.BAND_POSITION:n.mode==="exactly"?e.fixedPositions.push({bandIndex:n.bandIndex,exactPosition:n.position}):n.mode==="after"?e.rules.push({bandIndex:n.bandIndex,minPosition:n.position,requiredBefore:[]}):e.rules.push({bandIndex:n.bandIndex,maxPosition:n.position,requiredBefore:[]});break;case $.BAND_ORDER:e.bandOrdering.push({before:n.before,after:n.after});break;case $.PLAYER_APPEARANCE:e.playerAppearance.push({player:n.player,position:n.position,mode:n.mode});break}return e}function nt(t,e){t.querySelectorAll('input[type="number"]').forEach(r=>{const o=()=>{let a=parseInt(r.value,10);(isNaN(a)||a<1)&&(a=1),a>e&&(a=e),r.value=a};r.addEventListener("blur",o),r.addEventListener("change",o)})}function w(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const st=0,G=1,U=2,ne=3,se=5,oe=[0,1,1,1,0,1];function N(t,e,n){return t===e||n&&t!=="n/a"&&e==="n/a"?0:1}function rt(t,e,n,r,o){const a=o||oe;let i=0;if(n)for(let s=0;s<=5;s++)i+=N(t[s],e[s],r)*a[s];else{i+=N(t[st],e[st],r)*a[st];const s=Math.max(a[G],a[U]),u=N(t[G],e[G],r)*s+N(t[U],e[U],r)*s,c=N(t[G],e[U],r)*s+N(t[U],e[G],r)*s;i+=Math.min(u,c);for(let b=ne;b<=se;b++)i+=N(t[b],e[b],r)*a[b]}return i}function ae(t){return t=t-(t>>1&1431655765),t=(t&858993459)+(t>>2&858993459),(t+(t>>4)&252645135)*16843009>>24}function re(t,e={},n=3){const{distinguishGuitar:r=!0,freeLeave:o=!1,costWeights:a,constraints:i={}}=e,{fixedLast:s=null,rules:u=[],fixedPositions:c=[],bandOrdering:b=[],playerAppearance:h=[]}=i,f=t.length,p=[];for(let l=0;l<f;l++)l!==s&&p.push(l);const v=p.length;if(v>20)throw new Error(`Too many bands for bitmask DP (${v}). Max supported is 20.`);const y=new Map;p.forEach((l,d)=>y.set(l,d));const T=u.filter(l=>y.has(l.bandIndex)).map(l=>({localIndex:y.get(l.bandIndex),maxPosition:l.maxPosition||null,minPosition:l.minPosition||null,requiredBefore:(l.requiredBefore||[]).filter(d=>y.has(d)).map(d=>y.get(d))})),k=c.filter(l=>y.has(l.bandIndex)).map(l=>({localIndex:y.get(l.bandIndex),position:l.exactPosition})),E=b.filter(l=>y.has(l.before)&&y.has(l.after)).map(l=>({before:y.get(l.before),after:y.get(l.after)})),m=[];for(const l of h){const d=[];for(let A=0;A<f;A++)A!==s&&t[A].members.some(S=>S===l.player)&&y.has(A)&&d.push(y.get(A));d.length>0&&m.push({localBands:d,position:l.position,mode:l.mode})}const g=Array.from({length:v},()=>new Int32Array(v));for(let l=0;l<v;l++)for(let d=0;d<v;d++)l!==d&&(g[l][d]=rt(t[p[l]].members,t[p[d]].members,r,o,a));let I=null;if(s!==null){I=new Int32Array(v);for(let l=0;l<v;l++)I[l]=rt(t[p[l]].members,t[s].members,r,o,a)}const P=2147483647,L=1<<v,D=L-1,C=new Int32Array(v*L).fill(P),bt=new Int32Array(v*L).fill(-1);function Ft(l){for(const d of T)if(d.localIndex===l&&(d.requiredBefore.length>0||d.minPosition&&1<d.minPosition))return!1;for(const d of k)if(d.localIndex===l&&d.position!==1||d.localIndex!==l&&d.position===1)return!1;for(const d of E)if(d.after===l)return!1;for(const d of m)if(d.mode==="after"&&d.localBands.includes(l)&&1<d.position)return!1;return!0}function _t(l,d,A){for(const S of T)if(S.localIndex===l){if(S.maxPosition&&A>S.maxPosition||S.minPosition&&A<S.minPosition)return!1;if(S.requiredBefore.length>0){let M=!1;for(const q of S.requiredBefore)if(d&1<<q){M=!0;break}if(!M)return!1}}for(const S of k)if(S.localIndex===l&&S.position!==A||S.localIndex!==l&&S.position===A)return!1;for(const S of E)if(S.after===l&&!(d&1<<S.before))return!1;for(const S of m)if(S.localBands.includes(l)&&(S.mode==="before"&&A>S.position||S.mode==="after"&&A<S.position))return!1;return!0}for(let l=0;l<v;l++)Ft(l)&&(C[l*L+(1<<l)]=0);for(let l=1;l<L;l++)for(let d=0;d<v;d++){const A=d*L+l;if(C[A]===P||!(l&1<<d))continue;const S=C[A],M=ae(l)+1;for(let q=0;q<v;q++){if(l&1<<q||!_t(q,l,M))continue;const _=l|1<<q,mt=S+g[d][q],Z=q*L+_;mt<C[Z]&&(C[Z]=mt,bt[Z]=d)}}const W=[];for(let l=0;l<v;l++){const d=l*L+D;if(C[d]===P)continue;const A=I!==null?C[d]+I[l]:C[d];W.push({last:l,cost:A})}if(W.length===0)return[];W.sort((l,d)=>l.cost-d.cost);const Q=[],ft=new Set;for(const l of W){if(Q.length>=n)break;const d=[];let A=D,S=l.last;for(;S!==-1;){d.push(S);const _=bt[S*L+A];A^=1<<S,S=_}d.reverse();const M=d.map(_=>p[_]);s!==null&&M.push(s);const q=M.join(",");ft.has(q)||(ft.add(q),Q.push({path:M,cost:l.cost}))}return Q}function ie(t,e,n,r,o){return e.map((a,i)=>{const s=t[a],u=i===0?null:rt(t[e[i-1]].members,s.members,n,r,o);return{bandIndex:a,name:s.name,members:s.members,cost:u}})}const le="selectedPath",Tt="timing",J=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."];function Ct(t,e,n,r,o,a){if(e.length===0){t.innerHTML=`
      <section class="section">
        <div class="step-nav">
          <button type="button" id="back-btn" class="btn btn-secondary">← 条件設定に戻る</button>
          <h2 class="section-title section-title-inline">Step 3: タイムテーブル選択</h2>
        </div>
        <div class="error-box">
          <p>条件を満たすタイムテーブルが見つかりませんでした。</p>
          <p>条件を緩和して再度お試しください。</p>
        </div>
      </section>
    `,t.querySelector("#back-btn").addEventListener("click",o);return}const i=e.map(s=>ie(n,s.path,!0,!1,r));t.innerHTML=`
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-btn" class="btn btn-secondary">← 条件設定に戻る</button>
        <h2 class="section-title section-title-inline">Step 3: タイムテーブル選択</h2>
      </div>
      <p class="subsection-desc">上位${e.length}件のタイムテーブルを表示しています。使用するものを選択してください。</p>

      ${e.map((s,u)=>`
        <div class="result-card" data-index="${u}">
          <div class="result-header">
            <span class="result-rank">#${u+1}</span>
            <span class="result-cost">合計転換コスト: ${s.cost}</span>
            <button type="button" class="btn btn-accent btn-select-result" data-index="${u}">これを選択</button>
          </div>
          <div class="band-table-wrap">
            <table class="band-table result-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>バンド名</th>
                  ${J.map(c=>`<th>${c}</th>`).join("")}
                  <th>転換コスト</th>
                </tr>
              </thead>
              <tbody>
                ${i[u].map((c,b)=>`
                  <tr>
                    <td>${b+1}</td>
                    <td>${it(c.name)}</td>
                    ${c.members.map(h=>`<td>${it(h)}</td>`).join("")}
                    <td>${c.cost===null?"-":c.cost}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `).join("")}
    </section>
  `,t.querySelector("#back-btn").addEventListener("click",o),t.querySelectorAll(".btn-select-result").forEach(s=>{s.addEventListener("click",()=>{const u=parseInt(s.dataset.index,10),c=e[u];x(le,c.path),a({path:c.path,cost:c.cost,details:i[u]})})})}function ce(t,e,n,r,o,a){const i=B(Tt,{minUnit:5,transitionTime:5,startTime:"12:00"});t.innerHTML=de(e,n,i,r),t.querySelector("#back-to-results").addEventListener("click",o);const s=t.querySelector("#min-unit"),u=t.querySelector("#transition-time"),c=t.querySelector("#start-time"),b=t.querySelector("#calc-timestamps"),h=t.querySelector("#timestamp-body"),f=t.querySelector("#proceed-to-export");let p=null;b.addEventListener("click",()=>{const v=parseInt(s.value,10)||5,y=parseInt(u.value,10)||5,T=c.value||"12:00";x(Tt,{minUnit:v,transitionTime:y,startTime:T}),p=gt(e,n,v,y,T),$t(h,p),f.classList.remove("hidden")}),i.startTime&&(p=gt(e,n,i.minUnit,i.transitionTime,i.startTime),$t(h,p),f.classList.remove("hidden")),f.addEventListener("click",()=>{p&&a&&a(p)})}function gt(t,e,n,r,o){const a=[];let i=ue(o);for(let s=0;s<t.length;s++){const u=t[s],b=e[u.bandIndex].estimatedTime,h=i,f=h+b+r,p=Math.ceil(f/n)*n;a.push({name:u.name,bandIndex:u.bandIndex,cost:u.cost,startTime:At(h),endTime:At(p),startMinutes:h,endMinutes:p,perfTime:b}),i=p}return a}function ue(t){const e=t.split(":");return parseInt(e[0],10)*60+parseInt(e[1],10)}function At(t){const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function de(t,e,n,r){return`
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-to-results" class="btn btn-secondary">← タイムテーブル選択に戻る</button>
        <h2 class="section-title section-title-inline">Step 4: タイミング設定</h2>
      </div>

      <p class="subsection-desc">選択されたタイムテーブル（合計転換コスト: ${r}）にタイムスタンプを設定します。</p>

      <div class="subsection">
        <h3 class="subsection-title">タイミング設定</h3>
        <p class="subsection-desc">
          「最小時間単位」は、各バンドの終了時刻を丸める単位です。<br>
          例: 5分に設定すると、演奏＋転換の合計が12分でも終了時刻は15分に切り上げられます。
        </p>
        <div class="timing-form">
          <label class="form-label">
            最小時間単位（分）
            <input type="number" id="min-unit" class="form-input" min="1" value="${n.minUnit}" />
          </label>
          <label class="form-label">
            転換時間（分）
            <input type="number" id="transition-time" class="form-input" min="0" value="${n.transitionTime}" />
          </label>
          <label class="form-label">
            開始時刻
            <input type="time" id="start-time" class="form-input" value="${n.startTime}" />
          </label>
          <button type="button" id="calc-timestamps" class="btn btn-primary">タイムスタンプ計算</button>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">タイムテーブル</h3>
        <div class="band-table-wrap">
          <table class="band-table timestamp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>時間</th>
                <th>バンド名</th>
                <th>演奏時間</th>
                <th>転換コスト</th>
              </tr>
            </thead>
            <tbody id="timestamp-body">
              <tr><td colspan="5" class="text-muted text-center">「タイムスタンプ計算」を押して計算してください</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="proceed-to-export" class="btn btn-accent hidden">→ 最終調整へ (Step 5)</button>
      </div>
    </section>
  `}function $t(t,e){t.innerHTML=e.map((n,r)=>`
    <tr>
      <td>${r+1}</td>
      <td class="timestamp-cell">${n.startTime}〜${n.endTime}</td>
      <td>${it(n.name)}</td>
      <td>${n.perfTime}分</td>
      <td>${n.cost===null?"-":n.cost}</td>
    </tr>
  `).join("")}function it(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const ot="breaks";function pe(t,e,n,r,o){const a=n.minUnit||5,i=document.getElementById("app");i&&i.classList.add("app-wide");let s=B(ot,[]);s=s.filter(h=>h.afterIndex>=0&&h.afterIndex<e.length-1);let u=at(e,s,n);c();function c(){t.innerHTML=fe(u,s,a,o),t.querySelector("#back-to-timing").addEventListener("click",()=>{i&&i.classList.remove("app-wide"),r()}),t.querySelectorAll(".btn-add-break").forEach(f=>{f.addEventListener("click",()=>{const p=parseInt(f.dataset.after,10);s.some(v=>v.afterIndex===p)||b(f,p,a)})}),t.querySelectorAll(".btn-remove-break").forEach(f=>{f.addEventListener("click",()=>{const p=parseInt(f.dataset.after,10);s=s.filter(v=>v.afterIndex!==p),x(ot,s),u=at(e,s,n),c()})});const h=t.querySelector("#copy-clipboard");h&&h.addEventListener("click",()=>{const f=be(u,s,o);navigator.clipboard.writeText(f).then(()=>{h.textContent="✔ コピーしました",h.classList.add("btn-copied"),setTimeout(()=>{h.textContent="クリップボードにコピー",h.classList.remove("btn-copied")},2e3)})})}function b(h,f,p){const v=h.closest(".break-insert-row");v.innerHTML=`
      <div class="break-input-row">
        <label class="break-input-label">
          休憩時間（${p}分単位）
          <input type="number" class="form-input break-duration-input" min="${p}" step="${p}" value="${p}" />
        </label>
        <button type="button" class="btn btn-accent btn-confirm-break">追加</button>
        <button type="button" class="btn btn-secondary btn-cancel-break">取消</button>
      </div>
    `;const y=v.querySelector(".break-duration-input"),T=v.querySelector(".btn-confirm-break"),k=v.querySelector(".btn-cancel-break");T.addEventListener("click",()=>{const E=parseInt(y.value,10);if(!E||E<p||E%p!==0){y.style.borderColor="#e74c3c";return}s.push({afterIndex:f,duration:E}),s.sort((m,g)=>m.afterIndex-g.afterIndex),x(ot,s),u=at(e,s,n),c()}),k.addEventListener("click",()=>{c()}),y.focus()}}function at(t,e,n){const r=n.minUnit||5,o=n.transitionTime||5;let a=me(n.startTime||"12:00");const i=new Map;for(const u of e)i.set(u.afterIndex,u.duration);const s=[];for(let u=0;u<t.length;u++){const c=t[u],b=a,h=b+c.perfTime+o,f=Math.ceil(h/r)*r;s.push({...c,startTime:Lt(b),endTime:Lt(f),startMinutes:b,endMinutes:f}),a=f;const p=i.get(u);p!==void 0&&(a+=p)}return s}function be(t,e,n){const r=new Map;for(const a of e)r.set(a.afterIndex,a.duration);const o=[];for(let a=0;a<t.length;a++){const i=t[a],s=`${i.startTime}〜${i.endTime}`,u=n&&n[i.bandIndex],c=u?u.members.join("	"):"";o.push(`${s}	${i.name}	${c}	${i.perfTime}分`);const b=r.get(a);b!==void 0&&o.push(`	休憩 (${b}分)`)}return o.join(`
`)}function fe(t,e,n,r){const o=new Map;for(const c of e)o.set(c.afterIndex,c.duration);const a=t.length>0?t[0].startTime:"--:--",i=t.length>0?t[t.length-1].endTime:"--:--",s=4+J.length,u=[];for(let c=0;c<t.length;c++){const b=t[c],h=r&&r[b.bandIndex],f=h?h.members.map(p=>`<td>${xt(p)}</td>`).join(""):J.map(()=>"<td>-</td>").join("");if(u.push(`
      <tr>
        <td>${c+1}</td>
        <td class="timestamp-cell">${b.startTime}〜${b.endTime}</td>
        <td>${xt(b.name)}</td>
        ${f}
        <td>${b.perfTime}分</td>
      </tr>
    `),c<t.length-1){const p=o.get(c);p!==void 0?u.push(`
          <tr class="break-row">
            <td colspan="${s}">
              <div class="break-display">
                <span class="break-label">休憩 ${p}分</span>
                <button type="button" class="btn-remove-break" data-after="${c}" title="削除">✕</button>
              </div>
            </td>
          </tr>
        `):u.push(`
          <tr class="break-insert-row">
            <td colspan="${s}">
              <button type="button" class="btn-add-break" data-after="${c}" title="休憩を追加">+</button>
            </td>
          </tr>
        `)}}return`
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-to-timing" class="btn btn-secondary">← タイミング設定に戻る</button>
        <h2 class="section-title section-title-inline">Step 5: 最終調整・エクスポート</h2>
      </div>

      <p class="subsection-desc">
        バンド間に休憩を挿入できます。「+」ボタンをクリックして休憩時間を設定してください。<br>
        休憩時間は最小時間単位（${n}分）の倍数でのみ指定できます。
      </p>

      <div class="subsection">
        <h3 class="subsection-title">最終タイムテーブル</h3>
        <p class="subsection-desc">${a} 〜 ${i}</p>
        <div class="band-table-wrap">
          <table class="band-table timestamp-table final-table">
            <thead>
              <tr>
                <th>#</th>
                <th>時間</th>
                <th>バンド名</th>
                ${J.map(c=>`<th>${c}</th>`).join("")}
                <th>演奏時間</th>
              </tr>
            </thead>
            <tbody>
              ${u.join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="copy-clipboard" class="btn btn-accent">クリップボードにコピー</button>
      </div>
    </section>
  `}function me(t){const e=t.split(":");return parseInt(e[0],10)*60+parseInt(e[1],10)}function Lt(t){const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function xt(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const lt=document.getElementById("theme-switcher"),he=wt();Mt(he);lt.addEventListener("click",t=>{const e=t.target.closest(".theme-btn");if(!e)return;const n=e.dataset.theme,r=Ht(n);Mt(r)});function Mt(t){lt&&lt.querySelectorAll(".theme-btn").forEach(e=>{e.classList.toggle("active",e.dataset.theme===t)})}const F=document.querySelector(".app-main");let z=null,ct=null,dt=null,ut=null;function Nt(){Ut(F,{onProceed:V})}function V(){const t=B("players",[]),e=B("bands",[]);if(e.length<2){alert("タイムテーブルを生成するには、最低2つのバンドが必要です。");return}Jt(F,t,e,Nt)}function ve(t,e){const n=B("bands",[]);dt=n,ct=t;const r=ee(e);try{z=re(n,{distinguishGuitar:!0,freeLeave:!1,costWeights:t,constraints:r},5)}catch(o){alert(`最適化エラー: ${o.message}`);return}Ct(F,z,n,t,V,pt)}function pt(t){ut=t;const e=dt||B("bands",[]);ce(F,t.details,e,t.cost,()=>{z&&ct?Ct(F,z,e,ct,V,pt):V()},n=>{x("schedule",n),Rt(n)})}function Rt(t){const e=B("timing",{minUnit:5,transitionTime:5,startTime:"12:00"}),n=dt||B("bands",[]);pe(F,t,e,()=>{ut?pt(ut):V()},n)}document.addEventListener("themis:generate",t=>{const{costWeights:e,rules:n}=t.detail;ve(e,n)});document.addEventListener("themis:scheduleReady",t=>{const{schedule:e}=t.detail;Rt(e)});Nt();
