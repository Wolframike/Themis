(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(r){if(r.ep)return;r.ep=!0;const a=n(r);fetch(r.href,a)}})();const It="themis_";function x(t,e){try{localStorage.setItem(It+t,JSON.stringify(e))}catch{}}function q(t,e=null){try{const n=localStorage.getItem(It+t);return n===null?e:JSON.parse(n)}catch{return e}}const Bt="theme",qt=["dark","light"];function Ot(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function kt(t){document.documentElement.setAttribute("data-theme",t)}function Pt(){const t=q(Bt),e=qt.includes(t)?t:Ot();return kt(e),e}function Ht(t){return qt.includes(t)?(kt(t),x(Bt,t),t):Pt()}function Gt(t,e){const n=[],i=[],r=new Set,a=t.split(`
`).filter(o=>o.trim()!=="");for(let o=0;o<a.length;o++){const s=o+1,l=a[o].split("	");if(l.length<8){i.push({row:s,message:`${s}行目: 列数が不足しています（${l.length}列）。最低8列（バンド名、6パート、時間）が必要です。`});continue}const d=l[l.length-1].trim(),h=l[l.length-2].trim(),f=l[l.length-3].trim(),b=l[l.length-4].trim(),v=l[l.length-5].trim(),S=l[l.length-6].trim(),T=l[l.length-7].trim(),E=l.slice(0,l.length-7).join("	").trim();if(!E){i.push({row:s,message:`${s}行目: バンド名が空です。`});continue}const m=[{label:"Vo.",value:T},{label:"L.Gt",value:S},{label:"B.Gt",value:v},{label:"Ba.",value:b},{label:"Dr.",value:f},{label:"Key.",value:h}];let $=!1;for(const L of m)L.value.includes(" ")&&(i.push({row:s,message:`${s}行目: ${L.label}のセル「${L.value}」にスペースが含まれています。セル内にスペースは使用できません。`}),$=!0);if($)continue;const I=jt(d,s);if(I.error){i.push(I.error);continue}const P=[T,S,v,b,f,h];for(const L of P)L&&L!==e&&r.add(L);n.push({name:E,members:P,estimatedTime:I.value})}return{bands:n,errors:i,players:Array.from(r).sort()}}function jt(t,e){const n=t.trim();if(!n)return{error:{row:e,message:`${e}行目: 演奏時間が空です。`}};if(/\d+\D+\d+/.test(n))return{error:{row:e,message:`${e}行目: 演奏時間「${n}」が曖昧です。数字が複数含まれているため、どの数字を使用すべきか判断できません。数字のみで入力してください（例: 「5」）。`}};const i=n.replace(/\D/g,"");if(!i)return{error:{row:e,message:`${e}行目: 演奏時間「${n}」に数字が含まれていません。`}};const r=parseInt(i,10);return r<=0?{error:{row:e,message:`${e}行目: 演奏時間は1分以上にしてください。`}}:{value:r}}const O="players",Y="bands",ht="emptyIndicator",vt="entryMode",yt=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],wt=["vocal","leadGuitar","backingGuitar","bass","drums","keyboard"];function Ut(t,e={}){const{onProceed:n}=e,i=q(O,[]),r=q(Y,[]),a=q(ht,"n/a"),o=q(vt,"manual");t.innerHTML=Yt(a,o);let s=i,u=r;t.querySelector("#tab-manual"),t.querySelector("#tab-paste"),Kt(t,m=>{x(vt,m)});const l=t.querySelector("#player-tag-input"),d=t.querySelector("#player-chips");H(d,s),l.addEventListener("keydown",m=>{if(m.key==="Enter"){m.preventDefault();const $=l.value.trim();$&&!s.includes($)&&(s.push($),x(O,s),H(d,s),G(t,s)),l.value=""}}),d.addEventListener("click",m=>{const $=m.target.closest(".chip-delete");if(!$)return;const I=$.dataset.name;s=s.filter(P=>P!==I),x(O,s),H(d,s),G(t,s)});const h=t.querySelector("#band-form"),f=t.querySelector("#band-table-body");K(f,u,s,t),G(t,s),h.addEventListener("submit",m=>{m.preventDefault();const $=Vt(h);$&&(u.push($),x(Y,u),K(f,u,s,t),h.reset())});const b=t.querySelector("#paste-btn"),v=t.querySelector("#paste-input"),S=t.querySelector("#empty-indicator"),T=t.querySelector("#paste-errors");v.addEventListener("input",()=>{v.style.height="auto",v.style.height=v.scrollHeight+"px"}),S.value=a,S.addEventListener("input",()=>{x(ht,S.value.trim()||"n/a")}),b.addEventListener("click",()=>{const m=v.value.trim();if(!m){St(T,[{row:0,message:"テキストが入力されていません。"}]);return}const $=S.value.trim()||"n/a",I=Gt(m,$);if(I.errors.length>0){St(T,I.errors);return}const P=new Set(s);let L=!1;for(const D of I.players)P.has(D)||(s.push(D),P.add(D),L=!0);L&&(x(O,s),H(d,s),G(t,s));for(const D of I.bands)u.push(D);x(Y,u),K(f,u,s,t),v.value="",T.innerHTML="",Wt(T,I.bands.length,I.players.length)});const B=t.querySelector("#clear-all-btn"),E=B.closest(".actions-bar");if(B.addEventListener("click",()=>{B.style.display="none";const m=document.createElement("div");m.className="clear-confirm-bar",m.innerHTML=`
      <span class="clear-confirm-text">全てのデータを削除しますか？</span>
      <button type="button" class="btn btn-danger btn-confirm-yes">削除する</button>
      <button type="button" class="btn btn-secondary btn-confirm-no">キャンセル</button>
    `,E.insertBefore(m,B),m.querySelector(".btn-confirm-yes").addEventListener("click",()=>{s=[],u=[],l.value="",x(O,s),x(Y,u),H(d,s),K(f,u,s,t),G(t,s),m.remove(),B.style.display=""}),m.querySelector(".btn-confirm-no").addEventListener("click",()=>{m.remove(),B.style.display=""})}),n){const m=t.querySelector("#proceed-btn");m&&m.addEventListener("click",n)}}function Yt(t,e){const n=e!=="paste";return`
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
                ${yt.map((i,r)=>`
                  <label class="form-label form-label-part">
                    ${i}
                    <select id="part-${wt[r]}" class="form-select part-dropdown">
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
          <textarea id="paste-input" class="input-textarea input-textarea-paste" rows="2" placeholder="King Gnu	井口	常田	n/a	新井	勢喜	井口	20分"></textarea>
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
                ${yt.map(i=>`<th>${i}</th>`).join("")}
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
  `}function H(t,e){if(e.length===0){t.innerHTML="";return}t.innerHTML=e.map(n=>`<span class="chip chip-removable">${R(n)}<button type="button" class="chip-delete" data-name="${R(n)}" title="削除">✕</button></span>`).join("")}function G(t,e){t.querySelectorAll(".part-dropdown").forEach(i=>{const r=i.value;i.innerHTML='<option value="n/a">— 空き —</option>';for(const a of e){const o=document.createElement("option");o.value=a,o.textContent=a,a===r&&(o.selected=!0),i.appendChild(o)}})}function K(t,e,n,i){e.length===0?t.innerHTML='<tr><td colspan="10" class="text-muted text-center">バンドが登録されていません</td></tr>':(t.innerHTML=e.map((a,o)=>`
      <tr>
        <td>${o+1}</td>
        <td>${R(a.name)}</td>
        ${a.members.map(s=>`<td>${R(s)}</td>`).join("")}
        <td>${a.estimatedTime}分</td>
        <td><button type="button" class="btn-icon btn-delete" data-index="${o}" title="削除">✕</button></td>
      </tr>
    `).join(""),t.querySelectorAll(".btn-delete").forEach(a=>{a.addEventListener("click",()=>{const o=parseInt(a.dataset.index,10);e.splice(o,1),x(Y,e),K(t,e,n,i)})}));const r=i.querySelector("#band-count");r&&(r.textContent=e.length>0?`${e.length}バンド登録済み`:"")}function Kt(t,e){t.querySelectorAll(".tab-btn").forEach(i=>{const r=i.cloneNode(!0);i.parentNode.replaceChild(r,i),r.addEventListener("click",()=>{const a=r.dataset.tab;t.querySelectorAll(".tab-btn").forEach(o=>o.classList.remove("active")),r.classList.add("active"),t.querySelector("#tab-manual").classList.toggle("hidden",a!=="manual"),t.querySelector("#tab-paste").classList.toggle("hidden",a!=="paste"),e&&e(a)})})}function Vt(t){const e=t.querySelector("#band-name").value.trim(),n=parseInt(t.querySelector("#band-time").value,10);if(!e||!n||n<=0)return null;const i=wt.map(r=>{const a=t.querySelector(`#part-${r}`);return a?a.value:"n/a"});return{name:e,members:i,estimatedTime:n}}function St(t,e){t.innerHTML=`
    <div class="paste-error-box">
      ${e.map(n=>`<p class="error-line">${R(n.message)}</p>`).join("")}
    </div>
  `}function Wt(t,e,n){t.innerHTML=`
    <div class="paste-success-box">
      <p>${e}バンドを取り込みました。${n>0?`${n}人の新しいメンバーを追加しました。`:""}</p>
    </div>
  `}function R(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const Et="costWeights",J="rules",Jt=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],tt=[0,1,1,1,0,1],A={BAND_POSITION:"bandPosition",BAND_ORDER:"bandOrder",PLAYER_APPEARANCE:"playerAppearance"};function zt(t,e,n,i){const r=q(Et,[...tt]),a=q(J,[]);let o=r.length===6?r:[...tt],s=a;t.innerHTML=Xt(o),t.querySelector("#back-to-step1").addEventListener("click",i),t.querySelectorAll(".cost-weight-input").forEach((E,m)=>{E.addEventListener("input",()=>{const $=parseInt(E.value,10);o[m]=isNaN($)?tt[m]:Math.max(0,Math.min(3,$)),E.value=o[m],x(Et,o)})});const l=t.querySelector("#rule-type"),d=t.querySelector("#add-rule-btn"),h=t.querySelector("#rules-list"),f=t.querySelector("#rule-config");l.addEventListener("change",()=>{et(f,l.value,n,e),nt(f,n.length)}),et(f,l.value,n,e),nt(f,n.length);function b(){x(J,s)}function v(E){const m=s[E];s.splice(E,1),x(J,s),l.value=m.type,et(f,m.type,n,e),nt(f,n.length),Qt(f,m),S()}function S(){Dt(h,s,n,e,b,v)}let T=t.querySelector("#rule-error");T||(T=document.createElement("p"),T.id="rule-error",T.className="rule-error-msg",d.parentNode.insertBefore(T,d.nextSibling)),d.addEventListener("click",()=>{T.textContent="";const E=Zt(f,l.value,n);if(E&&E.error){T.textContent=E.error;return}E&&(s.push(E),x(J,s),S())}),S(),t.querySelector("#proceed-to-generate").addEventListener("click",()=>{const E=new CustomEvent("themis:generate",{detail:{costWeights:o,rules:s}});document.dispatchEvent(E)})}function Xt(t,e,n){return`
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
          ${Jt.map((i,r)=>`
            <div class="cost-item">
              <label class="cost-label">${i}</label>
              <input type="number" class="form-input cost-weight-input" min="0" max="3" value="${t[r]}" />
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
                <option value="${A.BAND_POSITION}">バンドの配置指定</option>
                <option value="${A.BAND_ORDER}">バンドの順序指定</option>
                <option value="${A.PLAYER_APPEARANCE}">メンバーの出演位置</option>
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
  `}function et(t,e,n,i){const r=n.map((o,s)=>`<option value="${s}">${w(o.name)}</option>`).join(""),a=i.map(o=>`<option value="${w(o)}">${w(o)}</option>`).join("");switch(e){case A.BAND_POSITION:t.innerHTML=`
        <div class="form-row-sentence">
          <select id="rc-band" class="form-select">${r}</select>
          <span>は</span>
          <input type="number" id="rc-position" class="form-input form-input-narrow" min="1" max="${n.length}" value="1" />
          <span>番目</span>
          <select id="rc-pos-mode" class="form-select">
            <option value="exactly">ちょうど</option>
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;break;case A.BAND_ORDER:t.innerHTML=`
        <div class="form-row-sentence">
          <select id="rc-band-a" class="form-select">${r}</select>
          <span>の演奏は</span>
          <select id="rc-band-b" class="form-select">${r}</select>
          <span>の</span>
          <select id="rc-order-dir" class="form-select">
            <option value="before">前</option>
            <option value="after">後</option>
          </select>
        </div>
      `;break;case A.PLAYER_APPEARANCE:t.innerHTML=`
        <div class="form-row-sentence">
          <select id="rc-player" class="form-select">${a}</select>
          <span>の出演は全て</span>
          <input type="number" id="rc-appear-pos" class="form-input form-input-narrow" min="1" max="${n.length}" value="1" />
          <span>番目</span>
          <select id="rc-appear-mode" class="form-select">
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;break}}function Qt(t,e){switch(e.type){case A.BAND_POSITION:{const n=t.querySelector("#rc-band"),i=t.querySelector("#rc-pos-mode"),r=t.querySelector("#rc-position");n&&(n.value=String(e.bandIndex)),i&&(i.value=e.mode),r&&(r.value=e.position);break}case A.BAND_ORDER:{const n=t.querySelector("#rc-band-a"),i=t.querySelector("#rc-band-b"),r=t.querySelector("#rc-order-dir");n&&(n.value=String(e.before)),i&&(i.value=String(e.after)),r&&(r.value="before");break}case A.PLAYER_APPEARANCE:{const n=t.querySelector("#rc-player"),i=t.querySelector("#rc-appear-mode"),r=t.querySelector("#rc-appear-pos");n&&(n.value=e.player),i&&(i.value=e.mode),r&&(r.value=e.position);break}}}function Zt(t,e,n,i){switch(e){case A.BAND_POSITION:{const r=parseInt(t.querySelector("#rc-band").value,10),a=t.querySelector("#rc-pos-mode").value,o=parseInt(t.querySelector("#rc-position").value,10);return isNaN(r)||isNaN(o)||o<1?null:{type:A.BAND_POSITION,bandIndex:r,bandName:n[r]?.name||"",mode:a,position:o}}case A.BAND_ORDER:{const r=parseInt(t.querySelector("#rc-band-a").value,10),a=parseInt(t.querySelector("#rc-band-b").value,10),o=t.querySelector("#rc-order-dir").value;if(isNaN(r)||isNaN(a))return null;if(r===a)return{error:"同じバンドを指定することはできません。"};const s=o==="before"?r:a,u=o==="before"?a:r;return{type:A.BAND_ORDER,before:s,after:u,beforeName:n[s]?.name||"",afterName:n[u]?.name||""}}case A.PLAYER_APPEARANCE:{const r=t.querySelector("#rc-player").value,a=t.querySelector("#rc-appear-mode").value,o=parseInt(t.querySelector("#rc-appear-pos").value,10);return!r||isNaN(o)||o<1?null:{type:A.PLAYER_APPEARANCE,player:r,mode:a,position:o}}}return null}function Dt(t,e,n,i,r,a){if(e.length===0){t.innerHTML='<p class="text-muted">ルールが設定されていません。デフォルト設定で最適化されます。</p>';return}t.innerHTML=e.map((o,s)=>`
      <div class="rule-item" data-index="${s}">
        <span class="rule-text">${te(o)}</span>
        <span class="rule-edit-hint">クリックで編集</span>
        <button type="button" class="btn-icon btn-delete-rule" data-index="${s}" title="削除">✕</button>
      </div>
    `).join(""),t.querySelectorAll(".btn-delete-rule").forEach(o=>{o.addEventListener("click",s=>{s.stopPropagation();const u=parseInt(o.dataset.index,10);e.splice(u,1),r(),Dt(t,e,n,i,r,a)})}),a&&t.querySelectorAll(".rule-item").forEach(o=>{o.addEventListener("click",s=>{if(s.target.closest(".btn-delete-rule"))return;const u=parseInt(o.dataset.index,10);a(u)})})}function te(t){switch(t.type){case A.BAND_POSITION:return t.mode==="exactly"?`「${w(t.bandName)}」は ${t.position} 番目ちょうど`:t.mode==="after"?`「${w(t.bandName)}」は ${t.position} 番目以降`:`「${w(t.bandName)}」は ${t.position} 番目以前`;case A.BAND_ORDER:return`「${w(t.beforeName)}」の演奏は「${w(t.afterName)}」の前`;case A.PLAYER_APPEARANCE:return t.mode==="before"?`${w(t.player)} の出演は全て ${t.position} 番目以前`:`${w(t.player)} の出演は全て ${t.position} 番目以降`;default:return"不明なルール"}}function ee(t){const e={fixedLast:null,rules:[],fixedPositions:[],bandOrdering:[],playerAppearance:[]};for(const n of t)switch(n.type){case A.BAND_POSITION:n.mode==="exactly"?e.fixedPositions.push({bandIndex:n.bandIndex,exactPosition:n.position}):n.mode==="after"?e.rules.push({bandIndex:n.bandIndex,minPosition:n.position,requiredBefore:[]}):e.rules.push({bandIndex:n.bandIndex,maxPosition:n.position,requiredBefore:[]});break;case A.BAND_ORDER:e.bandOrdering.push({before:n.before,after:n.after});break;case A.PLAYER_APPEARANCE:e.playerAppearance.push({player:n.player,position:n.position,mode:n.mode});break}return e}function nt(t,e){t.querySelectorAll('input[type="number"]').forEach(i=>{const r=()=>{let a=parseInt(i.value,10);(isNaN(a)||a<1)&&(a=1),a>e&&(a=e),i.value=a};i.addEventListener("blur",r),i.addEventListener("change",r)})}function w(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const st=0,j=1,U=2,ne=3,se=5,oe=[0,1,1,1,0,1];function N(t,e,n){return t===e||n&&t!=="n/a"&&e==="n/a"?0:1}function at(t,e,n,i,r){const a=r||oe;let o=0;if(n)for(let s=0;s<=5;s++)o+=N(t[s],e[s],i)*a[s];else{o+=N(t[st],e[st],i)*a[st];const s=Math.max(a[j],a[U]),u=N(t[j],e[j],i)*s+N(t[U],e[U],i)*s,l=N(t[j],e[U],i)*s+N(t[U],e[j],i)*s;o+=Math.min(u,l);for(let d=ne;d<=se;d++)o+=N(t[d],e[d],i)*a[d]}return o}function re(t){return t=t-(t>>1&1431655765),t=(t&858993459)+(t>>2&858993459),(t+(t>>4)&252645135)*16843009>>24}function ae(t,e={},n=3){const{distinguishGuitar:i=!0,freeLeave:r=!1,costWeights:a,constraints:o={}}=e,{fixedLast:s=null,rules:u=[],fixedPositions:l=[],bandOrdering:d=[],playerAppearance:h=[]}=o,f=t.length,b=[];for(let c=0;c<f;c++)c!==s&&b.push(c);const v=b.length;if(v>20)throw new Error(`Too many bands for bitmask DP (${v}). Max supported is 20.`);const S=new Map;b.forEach((c,p)=>S.set(c,p));const T=u.filter(c=>S.has(c.bandIndex)).map(c=>({localIndex:S.get(c.bandIndex),maxPosition:c.maxPosition||null,minPosition:c.minPosition||null,requiredBefore:(c.requiredBefore||[]).filter(p=>S.has(p)).map(p=>S.get(p))})),B=l.filter(c=>S.has(c.bandIndex)).map(c=>({localIndex:S.get(c.bandIndex),position:c.exactPosition})),E=d.filter(c=>S.has(c.before)&&S.has(c.after)).map(c=>({before:S.get(c.before),after:S.get(c.after)})),m=[];for(const c of h){const p=[];for(let g=0;g<f;g++)g!==s&&t[g].members.some(y=>y===c.player)&&S.has(g)&&p.push(S.get(g));p.length>0&&m.push({localBands:p,position:c.position,mode:c.mode})}const $=Array.from({length:v},()=>new Int32Array(v));for(let c=0;c<v;c++)for(let p=0;p<v;p++)c!==p&&($[c][p]=at(t[b[c]].members,t[b[p]].members,i,r,a));let I=null;if(s!==null){I=new Int32Array(v);for(let c=0;c<v;c++)I[c]=at(t[b[c]].members,t[s].members,i,r,a)}const P=2147483647,L=1<<v,D=L-1,C=new Int32Array(v*L).fill(P),ft=new Int32Array(v*L).fill(-1);function Ft(c){for(const p of T)if(p.localIndex===c&&(p.requiredBefore.length>0||p.minPosition&&1<p.minPosition))return!1;for(const p of B)if(p.localIndex===c&&p.position!==1||p.localIndex!==c&&p.position===1)return!1;for(const p of E)if(p.after===c)return!1;for(const p of m)if(p.mode==="after"&&p.localBands.includes(c)&&1<p.position)return!1;return!0}function _t(c,p,g){for(const y of T)if(y.localIndex===c){if(y.maxPosition&&g>y.maxPosition||y.minPosition&&g<y.minPosition)return!1;if(y.requiredBefore.length>0){let M=!1;for(const k of y.requiredBefore)if(p&1<<k){M=!0;break}if(!M)return!1}}for(const y of B)if(y.localIndex===c&&y.position!==g||y.localIndex!==c&&y.position===g)return!1;for(const y of E)if(y.after===c&&!(p&1<<y.before))return!1;for(const y of m)if(y.localBands.includes(c)&&(y.mode==="before"&&g>y.position||y.mode==="after"&&g<y.position))return!1;return!0}for(let c=0;c<v;c++)Ft(c)&&(C[c*L+(1<<c)]=0);for(let c=1;c<L;c++)for(let p=0;p<v;p++){const g=p*L+c;if(C[g]===P||!(c&1<<p))continue;const y=C[g],M=re(c)+1;for(let k=0;k<v;k++){if(c&1<<k||!_t(k,c,M))continue;const _=c|1<<k,mt=y+$[p][k],Z=k*L+_;mt<C[Z]&&(C[Z]=mt,ft[Z]=p)}}const W=[];for(let c=0;c<v;c++){const p=c*L+D;if(C[p]===P)continue;const g=I!==null?C[p]+I[c]:C[p];W.push({last:c,cost:g})}if(W.length===0)return[];W.sort((c,p)=>c.cost-p.cost);const Q=[],bt=new Set;for(const c of W){if(Q.length>=n)break;const p=[];let g=D,y=c.last;for(;y!==-1;){p.push(y);const _=ft[y*L+g];g^=1<<y,y=_}p.reverse();const M=p.map(_=>b[_]);s!==null&&M.push(s);const k=M.join(",");bt.has(k)||(bt.add(k),Q.push({path:M,cost:c.cost}))}return Q}function ie(t,e,n,i,r){return e.map((a,o)=>{const s=t[a],u=o===0?null:at(t[e[o-1]].members,s.members,n,i,r);return{bandIndex:a,name:s.name,members:s.members,cost:u}})}const ce="selectedPath",Tt="timing",z=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."];function Ct(t,e,n,i,r,a){if(e.length===0){t.innerHTML=`
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
    `,t.querySelector("#back-btn").addEventListener("click",r);return}const o=e.map(s=>ie(n,s.path,!0,!1,i));t.innerHTML=`
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
                  ${z.map(l=>`<th>${l}</th>`).join("")}
                  <th>転換コスト</th>
                </tr>
              </thead>
              <tbody>
                ${o[u].map((l,d)=>`
                  <tr>
                    <td>${d+1}</td>
                    <td>${it(l.name)}</td>
                    ${l.members.map(h=>`<td>${it(h)}</td>`).join("")}
                    <td>${l.cost===null?"-":l.cost}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `).join("")}
    </section>
  `,t.querySelector("#back-btn").addEventListener("click",r),t.querySelectorAll(".btn-select-result").forEach(s=>{s.addEventListener("click",()=>{const u=parseInt(s.dataset.index,10),l=e[u];x(ce,l.path),a({path:l.path,cost:l.cost,details:o[u]})})})}function le(t,e,n,i,r,a){const o=q(Tt,{minUnit:5,transitionTime:5,startTime:"12:00"});t.innerHTML=de(e,n,o,i),t.querySelector("#back-to-results").addEventListener("click",r);const s=t.querySelector("#min-unit"),u=t.querySelector("#transition-time"),l=t.querySelector("#start-time"),d=t.querySelector("#calc-timestamps"),h=t.querySelector("#timestamp-body"),f=t.querySelector("#proceed-to-export");let b=null;d.addEventListener("click",()=>{const v=parseInt(s.value,10)||5,S=parseInt(u.value,10)||5,T=l.value||"12:00";x(Tt,{minUnit:v,transitionTime:S,startTime:T}),b=gt(e,n,v,S,T),$t(h,b),f.classList.remove("hidden")}),o.startTime&&(b=gt(e,n,o.minUnit,o.transitionTime,o.startTime),$t(h,b),f.classList.remove("hidden")),f.addEventListener("click",()=>{b&&a&&a(b)})}function gt(t,e,n,i,r){const a=[];let o=ue(r);for(let s=0;s<t.length;s++){const u=t[s],d=e[u.bandIndex].estimatedTime,h=o,f=h+d+i,b=Math.ceil(f/n)*n;a.push({name:u.name,bandIndex:u.bandIndex,cost:u.cost,startTime:At(h),endTime:At(b),startMinutes:h,endMinutes:b,perfTime:d}),o=b}return a}function ue(t){const e=t.split(":");return parseInt(e[0],10)*60+parseInt(e[1],10)}function At(t){const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function de(t,e,n,i){return`
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-to-results" class="btn btn-secondary">← タイムテーブル選択に戻る</button>
        <h2 class="section-title section-title-inline">Step 4: タイミング設定</h2>
      </div>

      <p class="subsection-desc">選択されたタイムテーブル（合計転換コスト: ${i}）にタイムスタンプを設定します。</p>

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
  `}function $t(t,e){t.innerHTML=e.map((n,i)=>`
    <tr>
      <td>${i+1}</td>
      <td class="timestamp-cell">${n.startTime}〜${n.endTime}</td>
      <td>${it(n.name)}</td>
      <td>${n.perfTime}分</td>
      <td>${n.cost===null?"-":n.cost}</td>
    </tr>
  `).join("")}function it(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const ot="breaks";function pe(t,e,n,i,r){const a=n.minUnit||5;let o=q(ot,[]);o=o.filter(d=>d.afterIndex>=0&&d.afterIndex<e.length-1);let s=rt(e,o,n);u();function u(){t.innerHTML=be(s,o,a,r),t.querySelector("#back-to-timing").addEventListener("click",()=>{i()}),t.querySelectorAll(".btn-add-break").forEach(h=>{h.addEventListener("click",()=>{const f=parseInt(h.dataset.after,10);o.some(b=>b.afterIndex===f)||l(h,f,a)})}),t.querySelectorAll(".btn-remove-break").forEach(h=>{h.addEventListener("click",()=>{const f=parseInt(h.dataset.after,10);o=o.filter(b=>b.afterIndex!==f),x(ot,o),s=rt(e,o,n),u()})});const d=t.querySelector("#copy-clipboard");d&&d.addEventListener("click",()=>{const h=fe(s,o,r);navigator.clipboard.writeText(h).then(()=>{d.textContent="✔ コピーしました",d.classList.add("btn-copied"),setTimeout(()=>{d.textContent="クリップボードにコピー",d.classList.remove("btn-copied")},2e3)})})}function l(d,h,f){const b=d.closest("td");b.innerHTML=`
      <div class="break-input-row">
        <label class="break-input-label">
          休憩時間（${f}分単位）
          <input type="number" class="form-input break-duration-input" min="${f}" step="${f}" value="${f}" />
        </label>
        <button type="button" class="btn btn-accent btn-confirm-break">追加</button>
        <button type="button" class="btn btn-secondary btn-cancel-break">取消</button>
      </div>
    `;const v=b.querySelector(".break-duration-input"),S=b.querySelector(".btn-confirm-break"),T=b.querySelector(".btn-cancel-break");S.addEventListener("click",()=>{const B=parseInt(v.value,10);if(!B||B<f||B%f!==0){v.style.borderColor="#e74c3c";return}o.push({afterIndex:h,duration:B}),o.sort((E,m)=>E.afterIndex-m.afterIndex),x(ot,o),s=rt(e,o,n),u()}),T.addEventListener("click",()=>{u()}),v.focus()}}function rt(t,e,n){const i=n.minUnit||5,r=n.transitionTime||5;let a=me(n.startTime||"12:00");const o=new Map;for(const u of e)o.set(u.afterIndex,u.duration);const s=[];for(let u=0;u<t.length;u++){const l=t[u],d=a,h=d+l.perfTime+r,f=Math.ceil(h/i)*i;s.push({...l,startTime:Lt(d),endTime:Lt(f),startMinutes:d,endMinutes:f}),a=f;const b=o.get(u);b!==void 0&&(a+=b)}return s}function fe(t,e,n){const i=new Map;for(const a of e)i.set(a.afterIndex,a.duration);const r=[];for(let a=0;a<t.length;a++){const o=t[a],s=`${o.startTime}〜${o.endTime}`,u=n&&n[o.bandIndex],l=u?u.members.join("	"):"";r.push(`${s}	${o.name}	${l}	${o.perfTime}分`);const d=i.get(a);d!==void 0&&r.push(`	休憩 (${d}分)`)}return r.join(`
`)}function be(t,e,n,i){const r=new Map;for(const l of e)r.set(l.afterIndex,l.duration);const a=t.length>0?t[0].startTime:"--:--",o=t.length>0?t[t.length-1].endTime:"--:--",s=4+z.length,u=[];for(let l=0;l<t.length;l++){const d=t[l],h=i&&i[d.bandIndex],f=h?h.members.map(b=>`<td>${xt(b)}</td>`).join(""):z.map(()=>"<td>-</td>").join("");if(u.push(`
      <tr>
        <td>${l+1}</td>
        <td class="timestamp-cell">${d.startTime}〜${d.endTime}</td>
        <td>${xt(d.name)}</td>
        ${f}
        <td>${d.perfTime}分</td>
      </tr>
    `),l<t.length-1){const b=r.get(l);b!==void 0?u.push(`
          <tr class="break-row">
            <td colspan="${s}">
              <div class="break-display">
                <span class="break-label">休憩 ${b}分</span>
                <button type="button" class="btn-remove-break" data-after="${l}" title="削除">✕</button>
              </div>
            </td>
          </tr>
        `):u.push(`
          <tr class="break-insert-row">
            <td colspan="${s}">
              <button type="button" class="btn-add-break" data-after="${l}" title="休憩を追加">+</button>
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
        <p class="subsection-desc">${a} 〜 ${o}</p>
        <div class="band-table-wrap">
          <table class="band-table timestamp-table final-table">
            <thead>
              <tr>
                <th>#</th>
                <th>時間</th>
                <th>バンド名</th>
                ${z.map(l=>`<th>${l}</th>`).join("")}
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
  `}function me(t){const e=t.split(":");return parseInt(e[0],10)*60+parseInt(e[1],10)}function Lt(t){const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function xt(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const ct=document.getElementById("theme-switcher"),he=Pt();Mt(he);ct.addEventListener("click",t=>{const e=t.target.closest(".theme-btn");if(!e)return;const n=e.dataset.theme,i=Ht(n);Mt(i)});function Mt(t){ct&&ct.querySelectorAll(".theme-btn").forEach(e=>{e.classList.toggle("active",e.dataset.theme===t)})}const F=document.querySelector(".app-main");let X=null,lt=null,dt=null,ut=null;function Nt(){Ut(F,{onProceed:V})}function V(){const t=q("players",[]),e=q("bands",[]);if(e.length<2){alert("タイムテーブルを生成するには、最低2つのバンドが必要です。");return}zt(F,t,e,Nt)}function ve(t,e){const n=q("bands",[]);dt=n,lt=t;const i=ee(e);try{X=ae(n,{distinguishGuitar:!0,freeLeave:!1,costWeights:t,constraints:i},5)}catch(r){alert(`最適化エラー: ${r.message}`);return}Ct(F,X,n,t,V,pt)}function pt(t){ut=t;const e=dt||q("bands",[]);le(F,t.details,e,t.cost,()=>{X&&lt?Ct(F,X,e,lt,V,pt):V()},n=>{x("schedule",n),Rt(n)})}function Rt(t){const e=q("timing",{minUnit:5,transitionTime:5,startTime:"12:00"}),n=dt||q("bands",[]);pe(F,t,e,()=>{ut?pt(ut):V()},n)}document.addEventListener("themis:generate",t=>{const{costWeights:e,rules:n}=t.detail;ve(e,n)});document.addEventListener("themis:scheduleReady",t=>{const{schedule:e}=t.detail;Rt(e)});Nt();
