(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();const Bt="themis_";function A(t,e){try{localStorage.setItem(Bt+t,JSON.stringify(e))}catch{}}function k(t,e=null){try{const n=localStorage.getItem(Bt+t);return n===null?e:JSON.parse(n)}catch{return e}}const kt="theme",qt=["dark","light"];function Ht(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function Dt(t){document.documentElement.setAttribute("data-theme",t)}function wt(){const t=k(kt),e=qt.includes(t)?t:Ht();return Dt(e),e}function Gt(t){return qt.includes(t)?(Dt(t),A(kt,t),t):wt()}function jt(t,e){const n=[],i=[],s=new Set,r=t.split(`
`).filter(a=>a.trim()!=="");for(let a=0;a<r.length;a++){const o=a+1,u=r[a].split("	");if(u.length<8){i.push({row:o,message:`${o}行目: 列数が不足しています（${u.length}列）。最低8列（バンド名、6パート、時間）が必要です。`});continue}const p=u[u.length-1].trim(),h=u[u.length-2].trim(),f=u[u.length-3].trim(),b=u[u.length-4].trim(),y=u[u.length-5].trim(),v=u[u.length-6].trim(),I=u[u.length-7].trim(),q=u.slice(0,u.length-7).join("	").trim();if(!q){i.push({row:o,message:`${o}行目: バンド名が空です。`});continue}const m=[{label:"Vo.",value:I},{label:"L.Gt",value:v},{label:"B.Gt",value:y},{label:"Ba.",value:b},{label:"Dr.",value:f},{label:"Key.",value:h}];let x=!1;for(const E of m)E.value.includes(" ")&&(i.push({row:o,message:`${o}行目: ${E.label}のセル「${E.value}」にスペースが含まれています。セル内にスペースは使用できません。`}),x=!0);if(x)continue;const S=Ut(p,o);if(S.error){i.push(S.error);continue}const L=[I,v,y,b,f,h];for(const E of L)E&&E!==e&&s.add(E);n.push({name:q,members:L,estimatedTime:S.value})}return{bands:n,errors:i,players:Array.from(s).sort()}}function Ut(t,e){const n=t.trim();if(!n)return{error:{row:e,message:`${e}行目: 演奏時間が空です。`}};if(/\d+\D+\d+/.test(n))return{error:{row:e,message:`${e}行目: 演奏時間「${n}」が曖昧です。数字が複数含まれているため、どの数字を使用すべきか判断できません。数字のみで入力してください（例: 「5」）。`}};const i=n.replace(/\D/g,"");if(!i)return{error:{row:e,message:`${e}行目: 演奏時間「${n}」に数字が含まれていません。`}};const s=parseInt(i,10);return s<=0?{error:{row:e,message:`${e}行目: 演奏時間は1分以上にしてください。`}}:{value:s}}const O="players",Y="bands",ht="emptyIndicator",vt="entryMode",yt=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],Pt=["vocal","leadGuitar","backingGuitar","bass","drums","keyboard"];function Yt(t,e={}){const{onProceed:n}=e,i=k(O,[]),s=k(Y,[]),r=k(ht,"n/a"),a=k(vt,"manual");t.innerHTML=Kt(r,a);let o=i,l=s;t.querySelector("#tab-manual"),t.querySelector("#tab-paste"),Vt(t,m=>{A(vt,m)});const u=t.querySelector("#player-tag-input"),p=t.querySelector("#player-chips");H(p,o),u.addEventListener("keydown",m=>{if(m.key==="Enter"){m.preventDefault();const x=u.value.trim();x&&!o.includes(x)&&(o.push(x),A(O,o),H(p,o),G(t,o)),u.value=""}}),p.addEventListener("click",m=>{const x=m.target.closest(".chip-delete");if(!x)return;const S=x.dataset.name;o=o.filter(L=>L!==S),A(O,o),H(p,o),G(t,o)});const h=t.querySelector("#band-form"),f=t.querySelector("#band-table-body");K(f,l,o,t),G(t,o),h.addEventListener("submit",m=>{m.preventDefault();const x=Wt(h);x&&(l.push(x),A(Y,l),K(f,l,o,t),h.reset())});const b=t.querySelector("#paste-btn"),y=t.querySelector("#paste-input"),v=t.querySelector("#empty-indicator"),I=t.querySelector("#paste-errors");y.addEventListener("input",()=>{y.style.height="auto",y.style.height=y.scrollHeight+"px"}),v.value=r,v.addEventListener("input",()=>{A(ht,v.value.trim()||"n/a")}),b.addEventListener("click",()=>{const m=y.value.trim();if(!m){St(I,[{row:0,message:"テキストが入力されていません。"}]);return}const x=v.value.trim()||"n/a",S=jt(m,x);if(S.errors.length>0){St(I,S.errors);return}const L=new Set(o);let E=!1;for(const P of S.players)L.has(P)||(o.push(P),L.add(P),E=!0);E&&(A(O,o),H(p,o),G(t,o));for(const P of S.bands)l.push(P);A(Y,l),K(f,l,o,t),y.value="",I.innerHTML="",Jt(I,S.bands.length,S.players.length)});const B=t.querySelector("#clear-all-btn"),q=B.closest(".actions-bar");if(B.addEventListener("click",()=>{B.style.display="none";const m=document.createElement("div");m.className="clear-confirm-bar",m.innerHTML=`
      <span class="clear-confirm-text">全てのデータを削除しますか？</span>
      <button type="button" class="btn btn-danger btn-confirm-yes">削除する</button>
      <button type="button" class="btn btn-secondary btn-confirm-no">キャンセル</button>
    `,q.insertBefore(m,B),m.querySelector(".btn-confirm-yes").addEventListener("click",()=>{o=[],l=[],u.value="",A(O,o),A(Y,l),H(p,o),K(f,l,o,t),G(t,o),m.remove(),B.style.display=""}),m.querySelector(".btn-confirm-no").addEventListener("click",()=>{m.remove(),B.style.display=""})}),n){const m=t.querySelector("#proceed-btn");m&&m.addEventListener("click",n)}}function Kt(t,e){const n=e!=="paste";return`
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
                ${yt.map((i,s)=>`
                  <label class="form-label form-label-part">
                    ${i}
                    <select id="part-${Pt[s]}" class="form-select part-dropdown">
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
  `}function H(t,e){if(e.length===0){t.innerHTML="";return}t.innerHTML=e.map(n=>`<span class="chip chip-removable">${R(n)}<button type="button" class="chip-delete" data-name="${R(n)}" title="削除">✕</button></span>`).join("")}function G(t,e){t.querySelectorAll(".part-dropdown").forEach(i=>{const s=i.value;i.innerHTML='<option value="n/a">— 空き —</option>';for(const r of e){const a=document.createElement("option");a.value=r,a.textContent=r,r===s&&(a.selected=!0),i.appendChild(a)}})}function K(t,e,n,i){e.length===0?t.innerHTML='<tr><td colspan="10" class="text-muted text-center">バンドが登録されていません</td></tr>':(t.innerHTML=e.map((r,a)=>`
      <tr>
        <td>${a+1}</td>
        <td>${R(r.name)}</td>
        ${r.members.map(o=>`<td>${R(o)}</td>`).join("")}
        <td>${r.estimatedTime}分</td>
        <td><button type="button" class="btn-icon btn-delete" data-index="${a}" title="削除">✕</button></td>
      </tr>
    `).join(""),t.querySelectorAll(".btn-delete").forEach(r=>{r.addEventListener("click",()=>{const a=parseInt(r.dataset.index,10);e.splice(a,1),A(Y,e),K(t,e,n,i)})}));const s=i.querySelector("#band-count");s&&(s.textContent=e.length>0?`${e.length}バンド登録済み`:"")}function Vt(t,e){t.querySelectorAll(".tab-btn").forEach(i=>{const s=i.cloneNode(!0);i.parentNode.replaceChild(s,i),s.addEventListener("click",()=>{const r=s.dataset.tab;t.querySelectorAll(".tab-btn").forEach(a=>a.classList.remove("active")),s.classList.add("active"),t.querySelector("#tab-manual").classList.toggle("hidden",r!=="manual"),t.querySelector("#tab-paste").classList.toggle("hidden",r!=="paste"),e&&e(r)})})}function Wt(t){const e=t.querySelector("#band-name").value.trim(),n=parseInt(t.querySelector("#band-time").value,10);if(!e||!n||n<=0)return null;const i=Pt.map(s=>{const r=t.querySelector(`#part-${s}`);return r?r.value:"n/a"});return{name:e,members:i,estimatedTime:n}}function St(t,e){t.innerHTML=`
    <div class="paste-error-box">
      ${e.map(n=>`<p class="error-line">${R(n.message)}</p>`).join("")}
    </div>
  `}function Jt(t,e,n){t.innerHTML=`
    <div class="paste-success-box">
      <p>${e}バンドを取り込みました。${n>0?`${n}人の新しいメンバーを追加しました。`:""}</p>
    </div>
  `}function R(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const gt="costWeights",J="rules",Et="distinguishGuitar",zt=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],tt=[0,1,1,1,0,1],$={BAND_POSITION:"bandPosition",BAND_ORDER:"bandOrder",PLAYER_APPEARANCE:"playerAppearance"};function Xt(t,e,n,i){const s=k(gt,[...tt]),r=k(J,[]),a=k(Et,!0);let o=s.length===6?s:[...tt],l=r,u=a;t.innerHTML=Qt(o,n,l,u),t.querySelector("#back-to-step1").addEventListener("click",i),t.querySelectorAll(".cost-weight-input").forEach((S,L)=>{S.addEventListener("input",()=>{const E=parseInt(S.value,10);o[L]=isNaN(E)?tt[L]:Math.max(0,Math.min(3,E)),S.value=o[L],A(gt,o)})});const h=t.querySelector("#distinguish-guitar");h.addEventListener("change",()=>{u=h.checked,A(Et,u)});const f=t.querySelector("#rule-type"),b=t.querySelector("#add-rule-btn"),y=t.querySelector("#rules-list"),v=t.querySelector("#rule-config");f.addEventListener("change",()=>{et(v,f.value,n,e),nt(v,n.length)}),et(v,f.value,n,e),nt(v,n.length);function I(){A(J,l)}function B(S){const L=l[S];l.splice(S,1),A(J,l),f.value=L.type,et(v,L.type,n,e),nt(v,n.length),Zt(v,L),q()}function q(){Ct(y,l,n,e,I,B)}let m=t.querySelector("#rule-error");m||(m=document.createElement("p"),m.id="rule-error",m.className="rule-error-msg",b.parentNode.insertBefore(m,b.nextSibling)),b.addEventListener("click",()=>{m.textContent="";const S=te(v,f.value,n);if(S&&S.error){m.textContent=S.error;return}S&&(l.push(S),A(J,l),q())}),q(),t.querySelector("#proceed-to-generate").addEventListener("click",()=>{const S=new CustomEvent("themis:generate",{detail:{costWeights:o,rules:l,distinguishGuitar:u}});document.dispatchEvent(S)})}function Qt(t,e,n,i){return`
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
          ${zt.map((s,r)=>`
            <div class="cost-item">
              <label class="cost-label">${s}</label>
              <input type="number" class="form-input cost-weight-input" min="0" max="3" value="${t[r]}" />
            </div>
          `).join("")}
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">ギター区別</h3>
        <label class="toggle-label">
          <input type="checkbox" id="distinguish-guitar" class="toggle-checkbox" ${i?"checked":""} />
          <span class="toggle-switch"></span>
          <span class="toggle-text">リードギターとバッキングギターを区別する</span>
        </label>
        <p class="subsection-desc toggle-desc">
          <strong>ON:</strong> L.Gt と B.Gt は別々のパートとして扱います。同じ人がリードギターからバッキングギターに移動した場合、転換コストが発生します。<br>
          <strong>OFF:</strong> L.Gt と B.Gt を区別しません。同じ人がどちらのギターパートを担当しても転換コストが発生しません（例: バンドAではリードギター、バンドBではバッキングギターでもコスト0）。
        </p>
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
  `}function et(t,e,n,i){const s=n.map((a,o)=>`<option value="${o}">${w(a.name)}</option>`).join(""),r=i.map(a=>`<option value="${w(a)}">${w(a)}</option>`).join("");switch(e){case $.BAND_POSITION:t.innerHTML=`
        <div class="form-row-sentence">
          <select id="rc-band" class="form-select">${s}</select>
          <span>は</span>
          <input type="number" id="rc-position" class="form-input form-input-narrow" min="1" max="${n.length}" value="1" />
          <span>番目</span>
          <select id="rc-pos-mode" class="form-select">
            <option value="exactly">ちょうど</option>
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;break;case $.BAND_ORDER:t.innerHTML=`
        <div class="form-row-sentence">
          <select id="rc-band-a" class="form-select">${s}</select>
          <span>の演奏は</span>
          <select id="rc-band-b" class="form-select">${s}</select>
          <span>の</span>
          <select id="rc-order-dir" class="form-select">
            <option value="before">前</option>
            <option value="after">後</option>
          </select>
        </div>
      `;break;case $.PLAYER_APPEARANCE:t.innerHTML=`
        <div class="form-row-sentence">
          <select id="rc-player" class="form-select">${r}</select>
          <span>の出演は全て</span>
          <input type="number" id="rc-appear-pos" class="form-input form-input-narrow" min="1" max="${n.length}" value="1" />
          <span>番目</span>
          <select id="rc-appear-mode" class="form-select">
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;break}}function Zt(t,e){switch(e.type){case $.BAND_POSITION:{const n=t.querySelector("#rc-band"),i=t.querySelector("#rc-pos-mode"),s=t.querySelector("#rc-position");n&&(n.value=String(e.bandIndex)),i&&(i.value=e.mode),s&&(s.value=e.position);break}case $.BAND_ORDER:{const n=t.querySelector("#rc-band-a"),i=t.querySelector("#rc-band-b"),s=t.querySelector("#rc-order-dir");n&&(n.value=String(e.before)),i&&(i.value=String(e.after)),s&&(s.value="before");break}case $.PLAYER_APPEARANCE:{const n=t.querySelector("#rc-player"),i=t.querySelector("#rc-appear-mode"),s=t.querySelector("#rc-appear-pos");n&&(n.value=e.player),i&&(i.value=e.mode),s&&(s.value=e.position);break}}}function te(t,e,n,i){switch(e){case $.BAND_POSITION:{const s=parseInt(t.querySelector("#rc-band").value,10),r=t.querySelector("#rc-pos-mode").value,a=parseInt(t.querySelector("#rc-position").value,10);return isNaN(s)||isNaN(a)||a<1?null:{type:$.BAND_POSITION,bandIndex:s,bandName:n[s]?.name||"",mode:r,position:a}}case $.BAND_ORDER:{const s=parseInt(t.querySelector("#rc-band-a").value,10),r=parseInt(t.querySelector("#rc-band-b").value,10),a=t.querySelector("#rc-order-dir").value;if(isNaN(s)||isNaN(r))return null;if(s===r)return{error:"同じバンドを指定することはできません。"};const o=a==="before"?s:r,l=a==="before"?r:s;return{type:$.BAND_ORDER,before:o,after:l,beforeName:n[o]?.name||"",afterName:n[l]?.name||""}}case $.PLAYER_APPEARANCE:{const s=t.querySelector("#rc-player").value,r=t.querySelector("#rc-appear-mode").value,a=parseInt(t.querySelector("#rc-appear-pos").value,10);return!s||isNaN(a)||a<1?null:{type:$.PLAYER_APPEARANCE,player:s,mode:r,position:a}}}return null}function Ct(t,e,n,i,s,r){if(e.length===0){t.innerHTML='<p class="text-muted">ルールが設定されていません。デフォルト設定で最適化されます。</p>';return}t.innerHTML=e.map((a,o)=>`
      <div class="rule-item" data-index="${o}">
        <span class="rule-text">${ee(a)}</span>
        <span class="rule-edit-hint">クリックで編集</span>
        <button type="button" class="btn-icon btn-delete-rule" data-index="${o}" title="削除">✕</button>
      </div>
    `).join(""),t.querySelectorAll(".btn-delete-rule").forEach(a=>{a.addEventListener("click",o=>{o.stopPropagation();const l=parseInt(a.dataset.index,10);e.splice(l,1),s(),Ct(t,e,n,i,s,r)})}),r&&t.querySelectorAll(".rule-item").forEach(a=>{a.addEventListener("click",o=>{if(o.target.closest(".btn-delete-rule"))return;const l=parseInt(a.dataset.index,10);r(l)})})}function ee(t){switch(t.type){case $.BAND_POSITION:return t.mode==="exactly"?`「${w(t.bandName)}」は ${t.position} 番目ちょうど`:t.mode==="after"?`「${w(t.bandName)}」は ${t.position} 番目以降`:`「${w(t.bandName)}」は ${t.position} 番目以前`;case $.BAND_ORDER:return`「${w(t.beforeName)}」の演奏は「${w(t.afterName)}」の前`;case $.PLAYER_APPEARANCE:return t.mode==="before"?`${w(t.player)} の出演は全て ${t.position} 番目以前`:`${w(t.player)} の出演は全て ${t.position} 番目以降`;default:return"不明なルール"}}function ne(t){const e={fixedLast:null,rules:[],fixedPositions:[],bandOrdering:[],playerAppearance:[]};for(const n of t)switch(n.type){case $.BAND_POSITION:n.mode==="exactly"?e.fixedPositions.push({bandIndex:n.bandIndex,exactPosition:n.position}):n.mode==="after"?e.rules.push({bandIndex:n.bandIndex,minPosition:n.position,requiredBefore:[]}):e.rules.push({bandIndex:n.bandIndex,maxPosition:n.position,requiredBefore:[]});break;case $.BAND_ORDER:e.bandOrdering.push({before:n.before,after:n.after});break;case $.PLAYER_APPEARANCE:e.playerAppearance.push({player:n.player,position:n.position,mode:n.mode});break}return e}function nt(t,e){t.querySelectorAll('input[type="number"]').forEach(i=>{const s=()=>{let r=parseInt(i.value,10);(isNaN(r)||r<1)&&(r=1),r>e&&(r=e),i.value=r};i.addEventListener("blur",s),i.addEventListener("change",s)})}function w(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const st=0,j=1,U=2,se=3,oe=5,re=[0,1,1,1,0,1];function N(t,e,n){return t===e||n&&t!=="n/a"&&e==="n/a"?0:1}function at(t,e,n,i,s){const r=s||re;let a=0;if(n)for(let o=0;o<=5;o++)a+=N(t[o],e[o],i)*r[o];else{a+=N(t[st],e[st],i)*r[st];const o=Math.max(r[j],r[U]),l=N(t[j],e[j],i)*o+N(t[U],e[U],i)*o,u=N(t[j],e[U],i)*o+N(t[U],e[j],i)*o;a+=Math.min(l,u);for(let p=se;p<=oe;p++)a+=N(t[p],e[p],i)*r[p]}return a}function ae(t){return t=t-(t>>1&1431655765),t=(t&858993459)+(t>>2&858993459),(t+(t>>4)&252645135)*16843009>>24}function ie(t,e={},n=3){const{distinguishGuitar:i=!0,freeLeave:s=!1,costWeights:r,constraints:a={}}=e,{fixedLast:o=null,rules:l=[],fixedPositions:u=[],bandOrdering:p=[],playerAppearance:h=[]}=a,f=t.length,b=[];for(let c=0;c<f;c++)c!==o&&b.push(c);const y=b.length;if(y>20)throw new Error(`Too many bands for bitmask DP (${y}). Max supported is 20.`);const v=new Map;b.forEach((c,d)=>v.set(c,d));const I=l.filter(c=>v.has(c.bandIndex)).map(c=>({localIndex:v.get(c.bandIndex),maxPosition:c.maxPosition||null,minPosition:c.minPosition||null,requiredBefore:(c.requiredBefore||[]).filter(d=>v.has(d)).map(d=>v.get(d))})),B=u.filter(c=>v.has(c.bandIndex)).map(c=>({localIndex:v.get(c.bandIndex),position:c.exactPosition})),q=p.filter(c=>v.has(c.before)&&v.has(c.after)).map(c=>({before:v.get(c.before),after:v.get(c.after)})),m=[];for(const c of h){const d=[];for(let T=0;T<f;T++)T!==o&&t[T].members.some(g=>g===c.player)&&v.has(T)&&d.push(v.get(T));d.length>0&&m.push({localBands:d,position:c.position,mode:c.mode})}const x=Array.from({length:y},()=>new Int32Array(y));for(let c=0;c<y;c++)for(let d=0;d<y;d++)c!==d&&(x[c][d]=at(t[b[c]].members,t[b[d]].members,i,s,r));let S=null;if(o!==null){S=new Int32Array(y);for(let c=0;c<y;c++)S[c]=at(t[b[c]].members,t[o].members,i,s,r)}const L=2147483647,E=1<<y,P=E-1,C=new Int32Array(y*E).fill(L),bt=new Int32Array(y*E).fill(-1);function _t(c){for(const d of I)if(d.localIndex===c&&(d.requiredBefore.length>0||d.minPosition&&1<d.minPosition))return!1;for(const d of B)if(d.localIndex===c&&d.position!==1||d.localIndex!==c&&d.position===1)return!1;for(const d of q)if(d.after===c)return!1;for(const d of m)if(d.mode==="after"&&d.localBands.includes(c)&&1<d.position)return!1;return!0}function Ot(c,d,T){for(const g of I)if(g.localIndex===c){if(g.maxPosition&&T>g.maxPosition||g.minPosition&&T<g.minPosition)return!1;if(g.requiredBefore.length>0){let M=!1;for(const D of g.requiredBefore)if(d&1<<D){M=!0;break}if(!M)return!1}}for(const g of B)if(g.localIndex===c&&g.position!==T||g.localIndex!==c&&g.position===T)return!1;for(const g of q)if(g.after===c&&!(d&1<<g.before))return!1;for(const g of m)if(g.localBands.includes(c)&&(g.mode==="before"&&T>g.position||g.mode==="after"&&T<g.position))return!1;return!0}for(let c=0;c<y;c++)_t(c)&&(C[c*E+(1<<c)]=0);for(let c=1;c<E;c++)for(let d=0;d<y;d++){const T=d*E+c;if(C[T]===L||!(c&1<<d))continue;const g=C[T],M=ae(c)+1;for(let D=0;D<y;D++){if(c&1<<D||!Ot(D,c,M))continue;const _=c|1<<D,mt=g+x[d][D],Z=D*E+_;mt<C[Z]&&(C[Z]=mt,bt[Z]=d)}}const W=[];for(let c=0;c<y;c++){const d=c*E+P;if(C[d]===L)continue;const T=S!==null?C[d]+S[c]:C[d];W.push({last:c,cost:T})}if(W.length===0)return[];W.sort((c,d)=>c.cost-d.cost);const Q=[],ft=new Set;for(const c of W){if(Q.length>=n)break;const d=[];let T=P,g=c.last;for(;g!==-1;){d.push(g);const _=bt[g*E+T];T^=1<<g,g=_}d.reverse();const M=d.map(_=>b[_]);o!==null&&M.push(o);const D=M.join(",");ft.has(D)||(ft.add(D),Q.push({path:M,cost:c.cost}))}return Q}function ce(t,e,n,i,s){return e.map((r,a)=>{const o=t[r],l=a===0?null:at(t[e[a-1]].members,o.members,n,i,s);return{bandIndex:r,name:o.name,members:o.members,cost:l}})}const le="selectedPath",Tt="timing",z=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."];function Mt(t,e,n,i,s,r){if(e.length===0){t.innerHTML=`
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
    `,t.querySelector("#back-btn").addEventListener("click",s);return}const a=e.map(o=>ce(n,o.path,!0,!1,i));t.innerHTML=`
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-btn" class="btn btn-secondary">← 条件設定に戻る</button>
        <h2 class="section-title section-title-inline">Step 3: タイムテーブル選択</h2>
      </div>
      <p class="subsection-desc">上位${e.length}件のタイムテーブルを表示しています。使用するものを選択してください。</p>

      ${e.map((o,l)=>`
        <div class="result-card" data-index="${l}">
          <div class="result-header">
            <span class="result-rank">#${l+1}</span>
            <span class="result-cost">合計転換コスト: ${o.cost}</span>
            <button type="button" class="btn btn-accent btn-select-result" data-index="${l}">これを選択</button>
          </div>
          <div class="band-table-wrap">
            <table class="band-table result-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>バンド名</th>
                  ${z.map(u=>`<th>${u}</th>`).join("")}
                  <th>転換コスト</th>
                </tr>
              </thead>
              <tbody>
                ${a[l].map((u,p)=>`
                  <tr>
                    <td>${p+1}</td>
                    <td>${it(u.name)}</td>
                    ${u.members.map(h=>`<td>${it(h)}</td>`).join("")}
                    <td>${u.cost===null?"-":u.cost}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `).join("")}
    </section>
  `,t.querySelector("#back-btn").addEventListener("click",s),t.querySelectorAll(".btn-select-result").forEach(o=>{o.addEventListener("click",()=>{const l=parseInt(o.dataset.index,10),u=e[l];A(le,u.path),r({path:u.path,cost:u.cost,details:a[l]})})})}function ue(t,e,n,i,s,r){const a=k(Tt,{minUnit:5,transitionTime:5,startTime:"12:00"});t.innerHTML=pe(e,n,a,i),t.querySelector("#back-to-results").addEventListener("click",s);const o=t.querySelector("#min-unit"),l=t.querySelector("#transition-time"),u=t.querySelector("#start-time"),p=t.querySelector("#calc-timestamps"),h=t.querySelector("#timestamp-body"),f=t.querySelector("#proceed-to-export");let b=null;p.addEventListener("click",()=>{const y=parseInt(o.value,10)||5,v=parseInt(l.value,10)||5,I=u.value||"12:00";A(Tt,{minUnit:y,transitionTime:v,startTime:I}),b=At(e,n,y,v,I),Lt(h,b),f.classList.remove("hidden")}),a.startTime&&(b=At(e,n,a.minUnit,a.transitionTime,a.startTime),Lt(h,b),f.classList.remove("hidden")),f.addEventListener("click",()=>{b&&r&&r(b)})}function At(t,e,n,i,s){const r=[];let a=de(s);for(let o=0;o<t.length;o++){const l=t[o],p=e[l.bandIndex].estimatedTime,h=a,f=h+p+i,b=Math.ceil(f/n)*n;r.push({name:l.name,bandIndex:l.bandIndex,cost:l.cost,startTime:$t(h),endTime:$t(b),startMinutes:h,endMinutes:b,perfTime:p}),a=b}return r}function de(t){const e=t.split(":");return parseInt(e[0],10)*60+parseInt(e[1],10)}function $t(t){const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function pe(t,e,n,i){return`
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
  `}function Lt(t,e){t.innerHTML=e.map((n,i)=>`
    <tr>
      <td>${i+1}</td>
      <td class="timestamp-cell">${n.startTime}〜${n.endTime}</td>
      <td>${it(n.name)}</td>
      <td>${n.perfTime}分</td>
      <td>${n.cost===null?"-":n.cost}</td>
    </tr>
  `).join("")}function it(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const ot="breaks";function be(t,e,n,i,s){const r=n.minUnit||5;let a=k(ot,[]);a=a.filter(p=>p.afterIndex>=0&&p.afterIndex<e.length-1);let o=rt(e,a,n);l();function l(){t.innerHTML=me(o,a,r,s),t.querySelector("#back-to-timing").addEventListener("click",()=>{i()}),t.querySelectorAll(".btn-add-break").forEach(h=>{h.addEventListener("click",()=>{const f=parseInt(h.dataset.after,10);a.some(b=>b.afterIndex===f)||u(h,f,r)})}),t.querySelectorAll(".btn-remove-break").forEach(h=>{h.addEventListener("click",()=>{const f=parseInt(h.dataset.after,10);a=a.filter(b=>b.afterIndex!==f),A(ot,a),o=rt(e,a,n),l()})});const p=t.querySelector("#copy-clipboard");p&&p.addEventListener("click",()=>{const h=fe(o,a,s);navigator.clipboard.writeText(h).then(()=>{p.textContent="✔ コピーしました",p.classList.add("btn-copied"),setTimeout(()=>{p.textContent="クリップボードにコピー",p.classList.remove("btn-copied")},2e3)})})}function u(p,h,f){const b=p.closest("td");b.innerHTML=`
      <div class="break-input-row">
        <label class="break-input-label">
          休憩時間（${f}分単位）
          <input type="number" class="form-input break-duration-input" min="${f}" step="${f}" value="${f}" />
        </label>
        <button type="button" class="btn btn-accent btn-confirm-break">追加</button>
        <button type="button" class="btn btn-secondary btn-cancel-break">取消</button>
      </div>
    `;const y=b.querySelector(".break-duration-input"),v=b.querySelector(".btn-confirm-break"),I=b.querySelector(".btn-cancel-break");v.addEventListener("click",()=>{const B=parseInt(y.value,10);if(!B||B<f||B%f!==0){y.style.borderColor="#e74c3c";return}a.push({afterIndex:h,duration:B}),a.sort((q,m)=>q.afterIndex-m.afterIndex),A(ot,a),o=rt(e,a,n),l()}),I.addEventListener("click",()=>{l()}),y.focus()}}function rt(t,e,n){const i=n.minUnit||5,s=n.transitionTime||5;let r=he(n.startTime||"12:00");const a=new Map;for(const l of e)a.set(l.afterIndex,l.duration);const o=[];for(let l=0;l<t.length;l++){const u=t[l],p=r,h=p+u.perfTime+s,f=Math.ceil(h/i)*i;o.push({...u,startTime:xt(p),endTime:xt(f),startMinutes:p,endMinutes:f}),r=f;const b=a.get(l);b!==void 0&&(r+=b)}return o}function fe(t,e,n){const i=new Map;for(const r of e)i.set(r.afterIndex,r.duration);const s=[];for(let r=0;r<t.length;r++){const a=t[r],o=`${a.startTime}〜${a.endTime}`,l=n&&n[a.bandIndex],u=l?l.members.join("	"):"";s.push(`${o}	${a.name}	${u}	${a.perfTime}分`);const p=i.get(r);p!==void 0&&s.push(`	休憩 (${p}分)`)}return s.join(`
`)}function me(t,e,n,i){const s=new Map;for(const u of e)s.set(u.afterIndex,u.duration);const r=t.length>0?t[0].startTime:"--:--",a=t.length>0?t[t.length-1].endTime:"--:--",o=4+z.length,l=[];for(let u=0;u<t.length;u++){const p=t[u],h=i&&i[p.bandIndex],f=h?h.members.map(b=>`<td>${It(b)}</td>`).join(""):z.map(()=>"<td>-</td>").join("");if(l.push(`
      <tr>
        <td>${u+1}</td>
        <td class="timestamp-cell">${p.startTime}〜${p.endTime}</td>
        <td>${It(p.name)}</td>
        ${f}
        <td>${p.perfTime}分</td>
      </tr>
    `),u<t.length-1){const b=s.get(u);b!==void 0?l.push(`
          <tr class="break-row">
            <td colspan="${o}">
              <div class="break-display">
                <span class="break-label">休憩 ${b}分</span>
                <button type="button" class="btn-remove-break" data-after="${u}" title="削除">✕</button>
              </div>
            </td>
          </tr>
        `):l.push(`
          <tr class="break-insert-row">
            <td colspan="${o}">
              <button type="button" class="btn-add-break" data-after="${u}" title="休憩を追加">+</button>
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
        <p class="subsection-desc">${r} 〜 ${a}</p>
        <div class="band-table-wrap">
          <table class="band-table timestamp-table final-table">
            <thead>
              <tr>
                <th>#</th>
                <th>時間</th>
                <th>バンド名</th>
                ${z.map(u=>`<th>${u}</th>`).join("")}
                <th>演奏時間</th>
              </tr>
            </thead>
            <tbody>
              ${l.join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="copy-clipboard" class="btn btn-accent">クリップボードにコピー</button>
      </div>
    </section>
  `}function he(t){const e=t.split(":");return parseInt(e[0],10)*60+parseInt(e[1],10)}function xt(t){const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function It(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const ct=document.getElementById("theme-switcher"),ve=wt();Nt(ve);ct.addEventListener("click",t=>{const e=t.target.closest(".theme-btn");if(!e)return;const n=e.dataset.theme,i=Gt(n);Nt(i)});function Nt(t){ct&&ct.querySelectorAll(".theme-btn").forEach(e=>{e.classList.toggle("active",e.dataset.theme===t)})}const F=document.querySelector(".app-main");let X=null,lt=null,dt=null,ut=null;function Rt(){Yt(F,{onProceed:V})}function V(){const t=k("players",[]),e=k("bands",[]);if(e.length<2){alert("タイムテーブルを生成するには、最低2つのバンドが必要です。");return}Xt(F,t,e,Rt)}function ye(t,e,n){const i=k("bands",[]);dt=i,lt=t;const s=ne(e);try{X=ie(i,{distinguishGuitar:n,freeLeave:!1,costWeights:t,constraints:s},5)}catch(r){alert(`最適化エラー: ${r.message}`);return}Mt(F,X,i,t,V,pt)}function pt(t){ut=t;const e=dt||k("bands",[]);ue(F,t.details,e,t.cost,()=>{X&&lt?Mt(F,X,e,lt,V,pt):V()},n=>{A("schedule",n),Ft(n)})}function Ft(t){const e=k("timing",{minUnit:5,transitionTime:5,startTime:"12:00"}),n=dt||k("bands",[]);be(F,t,e,()=>{ut?pt(ut):V()},n)}document.addEventListener("themis:generate",t=>{const{costWeights:e,rules:n,distinguishGuitar:i}=t.detail;ye(e,n,i)});document.addEventListener("themis:scheduleReady",t=>{const{schedule:e}=t.detail;Ft(e)});Rt();
