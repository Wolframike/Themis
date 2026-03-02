(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();const Mt="themis_";function $(t,e){try{localStorage.setItem(Mt+t,JSON.stringify(e))}catch{}}function D(t,e=null){try{const n=localStorage.getItem(Mt+t);return n===null?e:JSON.parse(n)}catch{return e}}const Pt="theme",_t=["dark","light","cyber"];function Jt(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function Rt(t){document.documentElement.setAttribute("data-theme",t)}function Ot(){const t=D(Pt),e=_t.includes(t)?t:Jt();return Rt(e),e}function Wt(t){return _t.includes(t)?(Rt(t),$(Pt,t),t):Ot()}function zt(t,e){const n=[],a=[],s=new Set,o=t.split(`
`).filter(i=>i.trim()!=="");for(let i=0;i<o.length;i++){const r=i+1,u=o[i].split("	");if(u.length<8){a.push({row:r,message:`${r}行目: 列数が不足しています（${u.length}列）。最低8列（バンド名、6パート、時間）が必要です。`});continue}const p=u[u.length-1].trim(),v=u[u.length-2].trim(),f=u[u.length-3].trim(),h=u[u.length-4].trim(),I=u[u.length-5].trim(),g=u[u.length-6].trim(),S=u[u.length-7].trim(),q=u.slice(0,u.length-7).join("	").trim();if(!q){a.push({row:r,message:`${r}行目: バンド名が空です。`});continue}const C=[{label:"Vo.",value:S},{label:"L.Gt",value:g},{label:"B.Gt",value:I},{label:"Ba.",value:h},{label:"Dr.",value:f},{label:"Key.",value:v}];let R=!1;for(const b of C)b.value.includes(" ")&&(a.push({row:r,message:`${r}行目: ${b.label}のセル「${b.value}」にスペースが含まれています。セル内にスペースは使用できません。`}),R=!0);if(R)continue;const A=Xt(p,r);if(A.error){a.push(A.error);continue}const x=[S,g,I,h,f,v];for(const b of x)b&&b!==e&&s.add(b);n.push({name:q,members:x,estimatedTime:A.value})}return{bands:n,errors:a,players:Array.from(s).sort()}}function Xt(t,e){const n=t.trim();if(!n)return{error:{row:e,message:`${e}行目: 演奏時間が空です。`}};if(/\d+\D+\d+/.test(n))return{error:{row:e,message:`${e}行目: 演奏時間「${n}」が曖昧です。数字が複数含まれているため、どの数字を使用すべきか判断できません。数字のみで入力してください（例: 「5」）。`}};const a=n.replace(/\D/g,"");if(!a)return{error:{row:e,message:`${e}行目: 演奏時間「${n}」に数字が含まれていません。`}};const s=parseInt(a,10);return s<=0?{error:{row:e,message:`${e}行目: 演奏時間は1分以上にしてください。`}}:{value:s}}const V="players",X="bands",Lt="emptyIndicator",$t="entryMode",It=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],Ft=["vocal","leadGuitar","backingGuitar","bass","drums","keyboard"];function Qt(t,e={}){const{onProceed:n}=e,a=D(V,[]),s=D(X,[]),o=D(Lt,"n/a"),i=D($t,"manual");t.innerHTML=Zt(o,i);let r=a,l=s;t.querySelector("#tab-manual"),t.querySelector("#tab-paste"),te(t,b=>{$($t,b)});const u=t.querySelector("#player-tag-input"),p=t.querySelector("#player-chips");K(p,r),u.addEventListener("keydown",b=>{if(b.key==="Enter"){b.preventDefault();const N=u.value.trim();N&&!r.includes(N)&&(r.push(N),$(V,r),K(p,r),J(t,r)),u.value=""}}),p.addEventListener("click",b=>{const N=b.target.closest(".chip-delete");if(!N)return;const P=N.dataset.name;r=r.filter(_=>_!==P),$(V,r),K(p,r),J(t,r)});const v=t.querySelector("#band-form"),f=t.querySelector("#band-table-body");Q(f,l,r,t),J(t,r),v.addEventListener("submit",b=>{b.preventDefault();const N=ee(v);N&&(l.push(N),$(X,l),Q(f,l,r,t),v.reset())});const h=t.querySelector("#paste-btn"),I=t.querySelector("#paste-input"),g=t.querySelector("#empty-indicator"),S=t.querySelector("#paste-errors");I.addEventListener("input",()=>{I.style.height="auto",I.style.height=I.scrollHeight+"px"}),g.value=o,g.addEventListener("input",()=>{$(Lt,g.value.trim()||"n/a")}),h.addEventListener("click",()=>{const b=I.value.trim();if(!b){Bt(S,[{row:0,message:"テキストが入力されていません。"}]);return}const N=g.value.trim()||"n/a",P=zt(b,N);if(P.errors.length>0){Bt(S,P.errors);return}const _=new Set(r);let G=!1;for(const k of P.players)_.has(k)||(r.push(k),_.add(k),G=!0);G&&($(V,r),K(p,r),J(t,r));for(const k of P.bands)l.push(k);$(X,l),Q(f,l,r,t),I.value="",S.innerHTML="",ne(S,P.bands.length,P.players.length)});const E=t.querySelector("#clear-all-btn"),q=t.querySelector("#clear-confirm-bar"),C=t.querySelector("#btn-confirm-yes"),R=t.querySelector("#btn-confirm-no");function A(){E.classList.add("hidden"),q.classList.remove("hidden")}function x(){q.classList.add("hidden"),E.classList.remove("hidden")}if(E.addEventListener("click",b=>{b.stopPropagation(),A()}),C.addEventListener("click",b=>{b.stopPropagation(),r=[],l=[],u.value="",$(V,r),$(X,l),K(p,r),Q(f,l,r,t),J(t,r),x()}),R.addEventListener("click",b=>{b.stopPropagation(),x()}),n){const b=t.querySelector("#proceed-btn");b&&b.addEventListener("click",n)}}function Zt(t,e){const n=e!=="paste";return`
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
                ${It.map((a,s)=>`
                  <label class="form-label form-label-part">
                    ${a}
                    <select id="part-${Ft[s]}" class="form-select part-dropdown">
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
              <input type="text" id="empty-indicator" class="form-input form-input-short" value="${U(t)}" placeholder="n/a" />
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
                ${It.map(a=>`<th>${a}</th>`).join("")}
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
        <div id="clear-confirm-bar" class="clear-confirm-bar hidden">
          <span class="clear-confirm-text">全てのデータを削除しますか？</span>
          <button type="button" id="btn-confirm-yes" class="btn btn-danger">削除する</button>
          <button type="button" id="btn-confirm-no" class="btn btn-secondary">キャンセル</button>
        </div>
        <button type="button" id="proceed-btn" class="btn btn-accent">→ 条件設定へ (Step 2)</button>
      </div>
    </section>
  `}function K(t,e){if(e.length===0){t.innerHTML="";return}t.innerHTML=e.map(n=>`<span class="chip chip-removable">${U(n)}<button type="button" class="chip-delete" data-name="${U(n)}" title="削除">✕</button></span>`).join("")}function J(t,e){t.querySelectorAll(".part-dropdown").forEach(a=>{const s=a.value;a.innerHTML='<option value="n/a">— 空き —</option>';for(const o of e){const i=document.createElement("option");i.value=o,i.textContent=o,o===s&&(i.selected=!0),a.appendChild(i)}})}function Q(t,e,n,a){e.length===0?t.innerHTML='<tr><td colspan="10" class="text-muted text-center">バンドが登録されていません</td></tr>':(t.innerHTML=e.map((o,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${U(o.name)}</td>
        ${o.members.map(r=>`<td>${U(r)}</td>`).join("")}
        <td>${o.estimatedTime}分</td>
        <td><button type="button" class="btn-icon btn-delete" data-index="${i}" title="削除">✕</button></td>
      </tr>
    `).join(""),t.querySelectorAll(".btn-delete").forEach(o=>{o.addEventListener("click",()=>{const i=parseInt(o.dataset.index,10);e.splice(i,1),$(X,e),Q(t,e,n,a)})}));const s=a.querySelector("#band-count");s&&(s.textContent=e.length>0?`${e.length}バンド登録済み`:"")}function te(t,e){t.querySelectorAll(".tab-btn").forEach(a=>{const s=a.cloneNode(!0);a.parentNode.replaceChild(s,a),s.addEventListener("click",()=>{const o=s.dataset.tab;t.querySelectorAll(".tab-btn").forEach(i=>i.classList.remove("active")),s.classList.add("active"),t.querySelector("#tab-manual").classList.toggle("hidden",o!=="manual"),t.querySelector("#tab-paste").classList.toggle("hidden",o!=="paste"),e&&e(o)})})}function ee(t){const e=t.querySelector("#band-name").value.trim(),n=parseInt(t.querySelector("#band-time").value,10);if(!e||!n||n<=0)return null;const a=Ft.map(s=>{const o=t.querySelector(`#part-${s}`);return o?o.value:"n/a"});return{name:e,members:a,estimatedTime:n}}function Bt(t,e){t.innerHTML=`
    <div class="paste-error-box">
      ${e.map(n=>`<p class="error-line">${U(n.message)}</p>`).join("")}
    </div>
  `}function ne(t,e,n){t.innerHTML=`
    <div class="paste-success-box">
      <p>${e}バンドを取り込みました。${n>0?`${n}人の新しいメンバーを追加しました。`:""}</p>
    </div>
  `}function U(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const ct="costWeights",et="rules",xt="distinguishGuitar",se=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."],nt=[0,1,1,1,0,1],y={BAND_POSITION:"bandPosition",BAND_ORDER:"bandOrder",PLAYER_APPEARANCE:"playerAppearance",CONSECUTIVE_LIMIT:"consecutiveLimit",BAND_ADJACENCY:"bandAdjacency"};function re(t,e,n,a){const s=D(ct,[...nt]),o=D(et,[]),i=D(xt,!0);let r=s.length===6?s:[...nt],l=o,u=i;t.innerHTML=ae(r,n,l,u),t.querySelector("#back-to-step1").addEventListener("click",a),t.querySelectorAll(".cost-weight-input").forEach((A,x)=>{A.addEventListener("focus",()=>A.select()),A.addEventListener("change",()=>{let b=parseInt(A.value,10);isNaN(b)&&(b=nt[x]),b=Math.max(0,Math.min(3,b)),A.value=b,r[x]=b,$(ct,r)}),A.addEventListener("blur",()=>{let b=parseInt(A.value,10);isNaN(b)&&(b=nt[x]),b=Math.max(0,Math.min(3,b)),A.value=b,r[x]=b,$(ct,r)})});const v=t.querySelector("#distinguish-guitar");v.addEventListener("change",()=>{u=v.checked,$(xt,u)});const f=t.querySelector("#rule-type"),h=t.querySelector("#add-rule-btn"),I=t.querySelector("#rules-list"),g=t.querySelector("#rule-config");f.addEventListener("change",()=>{lt(g,f.value,n,e),ut(g,n.length)}),lt(g,f.value,n,e),ut(g,n.length);function S(){$(et,l)}function E(A){const x=l[A];l.splice(A,1),$(et,l),f.value=x.type,lt(g,x.type,n,e),ut(g,n.length),oe(g,x),q()}function q(){Ht(I,l,n,e,S,E)}let C=t.querySelector("#rule-error");C||(C=document.createElement("p"),C.id="rule-error",C.className="rule-error-msg",h.parentNode.insertBefore(C,h.nextSibling)),h.addEventListener("click",()=>{C.textContent="";const A=ie(g,f.value,n);if(A&&A.error){C.textContent=A.error;return}A&&(l.push(A),$(et,l),q())}),q(),t.querySelector("#proceed-to-generate").addEventListener("click",()=>{const A=new CustomEvent("themis:generate",{detail:{costWeights:r,rules:l,distinguishGuitar:u}});document.dispatchEvent(A)})}function ae(t,e,n,a){return`
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
          ${se.map((s,o)=>`
            <div class="cost-item">
              <label class="cost-label">${s}</label>
              <input type="number" class="form-input cost-weight-input" min="0" max="3" value="${t[o]}" />
            </div>
          `).join("")}
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">ギター区別</h3>
        <label class="toggle-label">
          <input type="checkbox" id="distinguish-guitar" class="toggle-checkbox" ${a?"checked":""} />
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
                <option value="${y.BAND_POSITION}">バンドの配置指定</option>
                <option value="${y.BAND_ORDER}">バンドの順序指定</option>
                <option value="${y.PLAYER_APPEARANCE}">メンバーの出演位置</option>
                <option value="${y.CONSECUTIVE_LIMIT}">連続出演制限</option>
                <option value="${y.BAND_ADJACENCY}">バンドの隣接指定</option>
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
  `}function lt(t,e,n,a){const s=n.map((i,r)=>`<option value="${r}">${M(i.name)}</option>`).join(""),o=a.map(i=>`<option value="${M(i)}">${M(i)}</option>`).join("");switch(e){case y.BAND_POSITION:t.innerHTML=`
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
      `;break;case y.BAND_ORDER:t.innerHTML=`
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
      `;break;case y.PLAYER_APPEARANCE:t.innerHTML=`
        <div class="form-row-sentence">
          <select id="rc-player" class="form-select">${o}</select>
          <span>の出演は全て</span>
          <input type="number" id="rc-appear-pos" class="form-input form-input-narrow" min="1" max="${n.length}" value="1" />
          <span>番目</span>
          <select id="rc-appear-mode" class="form-select">
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;break;case y.CONSECUTIVE_LIMIT:t.innerHTML=`
        <div class="form-row-sentence">
          <span>同一メンバーの連続出演を最大</span>
          <input type="number" id="rc-consec-limit" class="form-input form-input-narrow" min="1" max="${n.length}" value="2" />
          <span>バンドまでに制限</span>
        </div>
        <p id="consec-warning" class="rule-warning" style="display:none;">
          1に設定すると、転換コスト最小化ではなく「同じメンバーが連続で出演しない順番」を探索します。条件が厳しく解が見つからない場合があります。
        </p>
      `;{const i=t.querySelector("#rc-consec-limit"),r=t.querySelector("#consec-warning");i.addEventListener("input",()=>{r.style.display=parseInt(i.value,10)===1?"":"none"})}break;case y.BAND_ADJACENCY:t.innerHTML=`
        <div class="form-row-sentence">
          <select id="rc-adj-band-a" class="form-select">${s}</select>
          <span>を</span>
          <select id="rc-adj-band-b" class="form-select">${s}</select>
          <span>の</span>
          <select id="rc-adj-dir" class="form-select">
            <option value="rightBefore">直前</option>
            <option value="rightAfter">直後</option>
          </select>
          <span>に配置</span>
        </div>
      `;break}}function oe(t,e){switch(e.type){case y.BAND_POSITION:{const n=t.querySelector("#rc-band"),a=t.querySelector("#rc-pos-mode"),s=t.querySelector("#rc-position");n&&(n.value=String(e.bandIndex)),a&&(a.value=e.mode),s&&(s.value=e.position);break}case y.BAND_ORDER:{const n=t.querySelector("#rc-band-a"),a=t.querySelector("#rc-band-b"),s=t.querySelector("#rc-order-dir");n&&(n.value=String(e.before)),a&&(a.value=String(e.after)),s&&(s.value="before");break}case y.PLAYER_APPEARANCE:{const n=t.querySelector("#rc-player"),a=t.querySelector("#rc-appear-mode"),s=t.querySelector("#rc-appear-pos");n&&(n.value=e.player),a&&(a.value=e.mode),s&&(s.value=e.position);break}case y.CONSECUTIVE_LIMIT:{const n=t.querySelector("#rc-consec-limit");n&&(n.value=e.limit);const a=t.querySelector("#consec-warning");a&&(a.style.display=e.limit===1?"":"none");break}case y.BAND_ADJACENCY:{const n=t.querySelector("#rc-adj-band-a"),a=t.querySelector("#rc-adj-band-b"),s=t.querySelector("#rc-adj-dir");n&&(n.value=String(e.bandA)),a&&(a.value=String(e.bandB)),s&&(s.value=e.direction);break}}}function ie(t,e,n,a){switch(e){case y.BAND_POSITION:{const s=parseInt(t.querySelector("#rc-band").value,10),o=t.querySelector("#rc-pos-mode").value,i=parseInt(t.querySelector("#rc-position").value,10);return isNaN(s)||isNaN(i)||i<1?null:{type:y.BAND_POSITION,bandIndex:s,bandName:n[s]?.name||"",mode:o,position:i}}case y.BAND_ORDER:{const s=parseInt(t.querySelector("#rc-band-a").value,10),o=parseInt(t.querySelector("#rc-band-b").value,10),i=t.querySelector("#rc-order-dir").value;if(isNaN(s)||isNaN(o))return null;if(s===o)return{error:"同じバンドを指定することはできません。"};const r=i==="before"?s:o,l=i==="before"?o:s;return{type:y.BAND_ORDER,before:r,after:l,beforeName:n[r]?.name||"",afterName:n[l]?.name||""}}case y.PLAYER_APPEARANCE:{const s=t.querySelector("#rc-player").value,o=t.querySelector("#rc-appear-mode").value,i=parseInt(t.querySelector("#rc-appear-pos").value,10);return!s||isNaN(i)||i<1?null:{type:y.PLAYER_APPEARANCE,player:s,mode:o,position:i}}case y.CONSECUTIVE_LIMIT:{const s=parseInt(t.querySelector("#rc-consec-limit").value,10);return isNaN(s)||s<1?null:{type:y.CONSECUTIVE_LIMIT,limit:s}}case y.BAND_ADJACENCY:{const s=parseInt(t.querySelector("#rc-adj-band-a").value,10),o=parseInt(t.querySelector("#rc-adj-band-b").value,10),i=t.querySelector("#rc-adj-dir").value;return isNaN(s)||isNaN(o)?null:s===o?{error:"同じバンドを指定することはできません。"}:{type:y.BAND_ADJACENCY,bandA:s,bandB:o,bandAName:n[s]?.name||"",bandBName:n[o]?.name||"",direction:i}}}return null}function Ht(t,e,n,a,s,o){if(e.length===0){t.innerHTML='<p class="text-muted">ルールが設定されていません。デフォルト設定で最適化されます。</p>';return}t.innerHTML=e.map((i,r)=>`
      <div class="rule-item" data-index="${r}">
        <span class="rule-text">${ce(i)}</span>
        <span class="rule-edit-hint">クリックで編集</span>
        <button type="button" class="btn-icon btn-delete-rule" data-index="${r}" title="削除">✕</button>
      </div>
    `).join(""),t.querySelectorAll(".btn-delete-rule").forEach(i=>{i.addEventListener("click",r=>{r.stopPropagation();const l=parseInt(i.dataset.index,10);e.splice(l,1),s(),Ht(t,e,n,a,s,o)})}),o&&t.querySelectorAll(".rule-item").forEach(i=>{i.addEventListener("click",r=>{if(r.target.closest(".btn-delete-rule"))return;const l=parseInt(i.dataset.index,10);o(l)})})}function ce(t){switch(t.type){case y.BAND_POSITION:return t.mode==="exactly"?`「${M(t.bandName)}」は ${t.position} 番目ちょうど`:t.mode==="after"?`「${M(t.bandName)}」は ${t.position} 番目以降`:`「${M(t.bandName)}」は ${t.position} 番目以前`;case y.BAND_ORDER:return`「${M(t.beforeName)}」の演奏は「${M(t.afterName)}」の前`;case y.PLAYER_APPEARANCE:return t.mode==="before"?`${M(t.player)} の出演は全て ${t.position} 番目以前`:`${M(t.player)} の出演は全て ${t.position} 番目以降`;case y.CONSECUTIVE_LIMIT:return`連続出演制限: 同一メンバー最大 ${t.limit} バンド連続`;case y.BAND_ADJACENCY:return t.direction==="rightBefore"?`「${M(t.bandAName)}」を「${M(t.bandBName)}」の直前に配置`:`「${M(t.bandAName)}」を「${M(t.bandBName)}」の直後に配置`;default:return"不明なルール"}}function le(t){const e={fixedLast:null,rules:[],fixedPositions:[],bandOrdering:[],playerAppearance:[],consecutiveLimit:null,bandAdjacency:[]};for(const n of t)switch(n.type){case y.BAND_POSITION:n.mode==="exactly"?e.fixedPositions.push({bandIndex:n.bandIndex,exactPosition:n.position}):n.mode==="after"?e.rules.push({bandIndex:n.bandIndex,minPosition:n.position,requiredBefore:[]}):e.rules.push({bandIndex:n.bandIndex,maxPosition:n.position,requiredBefore:[]});break;case y.BAND_ORDER:e.bandOrdering.push({before:n.before,after:n.after});break;case y.PLAYER_APPEARANCE:e.playerAppearance.push({player:n.player,position:n.position,mode:n.mode});break;case y.CONSECUTIVE_LIMIT:(e.consecutiveLimit===null||n.limit<e.consecutiveLimit)&&(e.consecutiveLimit=n.limit);break;case y.BAND_ADJACENCY:{const a=n.direction==="rightBefore"?n.bandA:n.bandB,s=n.direction==="rightBefore"?n.bandB:n.bandA;e.bandAdjacency.push({before:a,after:s});break}}return e}function ut(t,e){t.querySelectorAll('input[type="number"]').forEach(a=>{const s=()=>{let o=parseInt(a.value,10);(isNaN(o)||o<1)&&(o=1),o>e&&(o=e),a.value=o};a.addEventListener("blur",s),a.addEventListener("change",s)})}function M(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const dt=0,W=1,z=2,ue=3,de=5,pe=[0,1,1,1,0,1];function j(t,e,n){return t===e||n&&t!=="n/a"&&e==="n/a"?0:1}function bt(t,e,n,a,s){const o=s||pe;let i=0;if(n)for(let r=0;r<=5;r++)i+=j(t[r],e[r],a)*o[r];else{i+=j(t[dt],e[dt],a)*o[dt];const r=Math.max(o[W],o[z]),l=j(t[W],e[W],a)*r+j(t[z],e[z],a)*r,u=j(t[W],e[z],a)*r+j(t[z],e[W],a)*r;i+=Math.min(l,u);for(let p=ue;p<=de;p++)i+=j(t[p],e[p],a)*o[p]}return i}function fe(t){return t=t-(t>>1&1431655765),t=(t&858993459)+(t>>2&858993459),(t+(t>>4)&252645135)*16843009>>24}function be(t,e={},n=3){const{distinguishGuitar:a=!0,freeLeave:s=!1,costWeights:o,constraints:i={}}=e,{fixedLast:r=null,rules:l=[],fixedPositions:u=[],bandOrdering:p=[],playerAppearance:v=[],consecutiveLimit:f=null,bandAdjacency:h=[]}=i,I=t.length,g=[];for(let c=0;c<I;c++)c!==r&&g.push(c);const S=g.length;if(S>20)throw new Error(`Too many bands for bitmask DP (${S}). Max supported is 20.`);const E=new Map;g.forEach((c,d)=>E.set(c,d));const q=l.filter(c=>E.has(c.bandIndex)).map(c=>({localIndex:E.get(c.bandIndex),maxPosition:c.maxPosition||null,minPosition:c.minPosition||null,requiredBefore:(c.requiredBefore||[]).filter(d=>E.has(d)).map(d=>E.get(d))})),C=u.filter(c=>E.has(c.bandIndex)).map(c=>({localIndex:E.get(c.bandIndex),position:c.exactPosition})),R=p.filter(c=>E.has(c.before)&&E.has(c.after)).map(c=>({before:E.get(c.before),after:E.get(c.after)})),A=[];for(const c of v){const d=[];for(let T=0;T<I;T++)T!==r&&t[T].members.some(B=>B===c.player)&&E.has(T)&&d.push(E.get(T));d.length>0&&A.push({localBands:d,position:c.position,mode:c.mode})}const x=h.filter(c=>E.has(c.before)&&E.has(c.after)).map(c=>({before:E.get(c.before),after:E.get(c.after)}));let b=null;if(f===1){b=Array.from({length:S},()=>new Uint8Array(S));for(let c=0;c<S;c++)for(let d=c+1;d<S;d++){const T=t[g[c]].members,B=t[g[d]].members;let m=!1;for(let L=0;L<T.length;L++){if(T[L]!=="n/a"){for(let w=0;w<B.length;w++)if(T[L]===B[w]){m=!0;break}}if(m)break}m&&(b[c][d]=1,b[d][c]=1)}}let N=null;f!==null&&f>=2&&(N=g.map(c=>new Set(t[c].members.filter(d=>d!=="n/a"))));const P=Array.from({length:S},()=>new Int32Array(S));for(let c=0;c<S;c++)for(let d=0;d<S;d++)c!==d&&(P[c][d]=bt(t[g[c]].members,t[g[d]].members,a,s,o));let _=null;if(r!==null){_=new Int32Array(S);for(let c=0;c<S;c++)_[c]=bt(t[g[c]].members,t[r].members,a,s,o)}const G=2147483647,k=1<<S,Et=k-1,O=new Int32Array(S*k).fill(G),at=new Int32Array(S*k).fill(-1);function Vt(c){for(const d of q)if(d.localIndex===c&&(d.requiredBefore.length>0||d.minPosition&&1<d.minPosition))return!1;for(const d of C)if(d.localIndex===c&&d.position!==1||d.localIndex!==c&&d.position===1)return!1;for(const d of R)if(d.after===c)return!1;for(const d of A)if(d.mode==="after"&&d.localBands.includes(c)&&1<d.position)return!1;for(const d of x)if(d.after===c)return!1;return!0}function Kt(c,d,T,B){for(const m of q)if(m.localIndex===c){if(m.maxPosition&&T>m.maxPosition||m.minPosition&&T<m.minPosition)return!1;if(m.requiredBefore.length>0){let L=!1;for(const w of m.requiredBefore)if(d&1<<w){L=!0;break}if(!L)return!1}}for(const m of C)if(m.localIndex===c&&m.position!==T||m.localIndex!==c&&m.position===T)return!1;for(const m of R)if(m.after===c&&!(d&1<<m.before))return!1;for(const m of A)if(m.localBands.includes(c)&&(m.mode==="before"&&T>m.position||m.mode==="after"&&T<m.position))return!1;if(b&&B>=0&&b[B][c])return!1;if(N&&f>=2){const m=[c];let L=B,w=d;for(let H=0;H<=f-1&&(m.push(L),m.length!==f+1);H++){const F=at[L*k+w];if(F===-1)break;w^=1<<L,L=F}if(m.length===f+1){const H=N[m[0]];for(const F of H){let Tt=!0;for(let it=1;it<m.length;it++)if(!N[m[it]].has(F)){Tt=!1;break}if(Tt)return!1}}}for(const m of x)if(m.after===c&&B!==m.before||m.before===B&&c!==m.after)return!1;return!0}for(let c=0;c<S;c++)Vt(c)&&(O[c*k+(1<<c)]=0);for(let c=1;c<k;c++)for(let d=0;d<S;d++){const T=d*k+c;if(O[T]===G||!(c&1<<d))continue;const B=O[T],m=fe(c)+1;for(let L=0;L<S;L++){if(c&1<<L||!Kt(L,c,m,d))continue;const w=c|1<<L,H=B+P[d][L],F=L*k+w;H<O[F]&&(O[F]=H,at[F]=d)}}const tt=[];for(let c=0;c<S;c++){const d=c*k+Et;if(O[d]===G)continue;const T=_!==null?O[d]+_[c]:O[d];tt.push({last:c,cost:T})}if(tt.length===0)return[];tt.sort((c,d)=>c.cost-d.cost);const ot=[],At=new Set;for(const c of tt){if(ot.length>=n)break;const d=[];let T=Et,B=c.last;for(;B!==-1;){d.push(B);const w=at[B*k+T];T^=1<<B,B=w}d.reverse();const m=d.map(w=>g[w]);r!==null&&m.push(r);const L=m.join(",");At.has(L)||(At.add(L),!(f!==null&&f>=2&&!me(m,t,f))&&ot.push({path:m,cost:c.cost}))}return ot}function me(t,e,n){const a=new Map;for(let s=0;s<t.length;s++){const o=new Set(e[t[s]].members.filter(r=>r!=="n/a")),i=new Map;for(const r of o){const u=(a.get(r)||0)+1;if(u>n)return!1;i.set(r,u)}a.clear();for(const[r,l]of i)a.set(r,l)}return!0}function he(t,e,n,a,s){return e.map((o,i)=>{const r=t[o],l=i===0?null:bt(t[e[i-1]].members,r.members,n,a,s);return{bandIndex:o,name:r.name,members:r.members,cost:l}})}const ve="selectedPath",Ct="timing",st=["Vo.","L.Gt","B.Gt","Ba.","Dr.","Key."];function jt(t,e,n,a,s,o){if(e.length===0){t.innerHTML=`
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
    `,t.querySelector("#back-btn").addEventListener("click",s);return}const i=e.map(r=>he(n,r.path,!0,!1,a));t.innerHTML=`
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-btn" class="btn btn-secondary">← 条件設定に戻る</button>
        <h2 class="section-title section-title-inline">Step 3: タイムテーブル選択</h2>
      </div>
      <p class="subsection-desc">上位${e.length}件のタイムテーブルを表示しています。使用するものを選択してください。</p>

      ${e.map((r,l)=>`
        <div class="result-card" data-index="${l}">
          <div class="result-header">
            <span class="result-rank">#${l+1}</span>
            <span class="result-cost">合計転換コスト: ${r.cost}</span>
            <button type="button" class="btn btn-accent btn-select-result" data-index="${l}">これを選択</button>
          </div>
          <div class="band-table-wrap">
            <table class="band-table result-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>バンド名</th>
                  ${st.map(u=>`<th>${u}</th>`).join("")}
                  <th>転換コスト</th>
                </tr>
              </thead>
              <tbody>
                ${i[l].map((u,p)=>`
                  <tr>
                    <td>${p+1}</td>
                    <td>${mt(u.name)}</td>
                    ${u.members.map(v=>`<td>${mt(v)}</td>`).join("")}
                    <td>${u.cost===null?"-":u.cost}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `).join("")}
    </section>
  `,t.querySelector("#back-btn").addEventListener("click",s),t.querySelectorAll(".btn-select-result").forEach(r=>{r.addEventListener("click",()=>{const l=parseInt(r.dataset.index,10),u=e[l];$(ve,u.path),o({path:u.path,cost:u.cost,details:i[l]})})})}function ye(t,e,n,a,s,o){const i=D(Ct,{minUnit:5,transitionTime:5,startTime:"12:00"});t.innerHTML=ge(e,n,i,a),t.querySelector("#back-to-results").addEventListener("click",s);const r=t.querySelector("#min-unit"),l=t.querySelector("#transition-time"),u=t.querySelector("#start-time"),p=t.querySelector("#calc-timestamps"),v=t.querySelector("#timestamp-body"),f=t.querySelector("#proceed-to-export");let h=null;p.addEventListener("click",()=>{const I=parseInt(r.value,10)||5,g=parseInt(l.value,10)||5,S=u.value||"12:00";$(Ct,{minUnit:I,transitionTime:g,startTime:S}),h=Nt(e,n,I,g,S),Dt(v,h),f.classList.remove("hidden")}),i.startTime&&(h=Nt(e,n,i.minUnit,i.transitionTime,i.startTime),Dt(v,h),f.classList.remove("hidden")),f.addEventListener("click",()=>{h&&o&&o(h)})}function Nt(t,e,n,a,s){const o=[];let i=Se(s);for(let r=0;r<t.length;r++){const l=t[r],p=e[l.bandIndex].estimatedTime,v=i,f=v+p+a,h=Math.ceil(f/n)*n;o.push({name:l.name,bandIndex:l.bandIndex,cost:l.cost,startTime:kt(v),endTime:kt(h),startMinutes:v,endMinutes:h,perfTime:p}),i=h}return o}function Se(t){const e=t.split(":");return parseInt(e[0],10)*60+parseInt(e[1],10)}function kt(t){const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function ge(t,e,n,a){return`
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-to-results" class="btn btn-secondary">← タイムテーブル選択に戻る</button>
        <h2 class="section-title section-title-inline">Step 4: タイミング設定</h2>
      </div>

      <p class="subsection-desc">選択されたタイムテーブル（合計転換コスト: ${a}）にタイムスタンプを設定します。</p>

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
  `}function Dt(t,e){t.innerHTML=e.map((n,a)=>`
    <tr>
      <td>${a+1}</td>
      <td class="timestamp-cell">${n.startTime}〜${n.endTime}</td>
      <td>${mt(n.name)}</td>
      <td>${n.perfTime}分</td>
      <td>${n.cost===null?"-":n.cost}</td>
    </tr>
  `).join("")}function mt(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const pt="breaks";function Ee(t,e,n,a,s){const o=n.minUnit||5;let i=D(pt,[]);i=i.filter(p=>p.afterIndex>=0&&p.afterIndex<e.length-1);let r=ft(e,i,n);l();function l(){t.innerHTML=Te(r,i,o,s),t.querySelector("#back-to-timing").addEventListener("click",()=>{a()}),t.querySelectorAll(".btn-add-break").forEach(v=>{v.addEventListener("click",()=>{const f=parseInt(v.dataset.after,10);i.some(h=>h.afterIndex===f)||u(v,f,o)})}),t.querySelectorAll(".btn-remove-break").forEach(v=>{v.addEventListener("click",()=>{const f=parseInt(v.dataset.after,10);i=i.filter(h=>h.afterIndex!==f),$(pt,i),r=ft(e,i,n),l()})});const p=t.querySelector("#copy-clipboard");p&&p.addEventListener("click",()=>{const v=Ae(r,i,s);navigator.clipboard.writeText(v).then(()=>{p.textContent="✔ コピーしました",p.classList.add("btn-copied"),setTimeout(()=>{p.textContent="クリップボードにコピー",p.classList.remove("btn-copied")},2e3)})})}function u(p,v,f){const h=p.closest("td");h.innerHTML=`
      <div class="break-input-row">
        <label class="break-input-label">
          休憩時間（${f}分単位）
          <input type="number" class="form-input break-duration-input" min="${f}" step="${f}" value="${f}" />
        </label>
        <button type="button" class="btn btn-accent btn-confirm-break">追加</button>
        <button type="button" class="btn btn-secondary btn-cancel-break">取消</button>
      </div>
    `;const I=h.querySelector(".break-duration-input"),g=h.querySelector(".btn-confirm-break"),S=h.querySelector(".btn-cancel-break");g.addEventListener("click",()=>{const E=parseInt(I.value,10);if(!E||E<f||E%f!==0){I.style.borderColor="#e74c3c";return}i.push({afterIndex:v,duration:E}),i.sort((q,C)=>q.afterIndex-C.afterIndex),$(pt,i),r=ft(e,i,n),l()}),S.addEventListener("click",()=>{l()}),I.focus()}}function ft(t,e,n){const a=n.minUnit||5,s=n.transitionTime||5;let o=Le(n.startTime||"12:00");const i=new Map;for(const l of e)i.set(l.afterIndex,l.duration);const r=[];for(let l=0;l<t.length;l++){const u=t[l],p=o,v=p+u.perfTime+s,f=Math.ceil(v/a)*a;r.push({...u,startTime:qt(p),endTime:qt(f),startMinutes:p,endMinutes:f}),o=f;const h=i.get(l);h!==void 0&&(o+=h)}return r}function Ae(t,e,n){const a=new Map;for(const o of e)a.set(o.afterIndex,o.duration);const s=[];for(let o=0;o<t.length;o++){const i=t[o],r=`${i.startTime}〜${i.endTime}`,l=n&&n[i.bandIndex],u=l?l.members.join("	"):"";s.push(`${r}	${i.name}	${u}	${i.perfTime}分`);const p=a.get(o);p!==void 0&&s.push(`	休憩 (${p}分)`)}return s.join(`
`)}function Te(t,e,n,a){const s=new Map;for(const u of e)s.set(u.afterIndex,u.duration);const o=t.length>0?t[0].startTime:"--:--",i=t.length>0?t[t.length-1].endTime:"--:--",r=4+st.length,l=[];for(let u=0;u<t.length;u++){const p=t[u],v=a&&a[p.bandIndex],f=v?v.members.map(h=>`<td>${wt(h)}</td>`).join(""):st.map(()=>"<td>-</td>").join("");if(l.push(`
      <tr>
        <td>${u+1}</td>
        <td class="timestamp-cell">${p.startTime}〜${p.endTime}</td>
        <td>${wt(p.name)}</td>
        ${f}
        <td>${p.perfTime}分</td>
      </tr>
    `),u<t.length-1){const h=s.get(u);h!==void 0?l.push(`
          <tr class="break-row">
            <td colspan="${r}">
              <div class="break-display">
                <span class="break-label">休憩 ${h}分</span>
                <button type="button" class="btn-remove-break" data-after="${u}" title="削除">✕</button>
              </div>
            </td>
          </tr>
        `):l.push(`
          <tr class="break-insert-row">
            <td colspan="${r}">
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
        <p class="subsection-desc">${o} 〜 ${i}</p>
        <div class="band-table-wrap">
          <table class="band-table timestamp-table final-table">
            <thead>
              <tr>
                <th>#</th>
                <th>時間</th>
                <th>バンド名</th>
                ${st.map(u=>`<th>${u}</th>`).join("")}
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
  `}function Le(t){const e=t.split(":");return parseInt(e[0],10)*60+parseInt(e[1],10)}function qt(t){const e=Math.floor(t/60)%24,n=t%60;return`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function wt(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}const ht=document.getElementById("theme-switcher"),$e=Ot();Gt($e);ht.addEventListener("click",t=>{const e=t.target.closest(".theme-btn");if(!e)return;const n=e.dataset.theme,a=Wt(n);Gt(a)});function Gt(t){ht&&ht.querySelectorAll(".theme-btn").forEach(e=>{e.classList.toggle("active",e.dataset.theme===t)})}const Y=document.querySelector(".app-main");let rt=null,vt=null,St=null,yt=null;function Ut(){Qt(Y,{onProceed:Z})}function Z(){const t=D("players",[]),e=D("bands",[]);if(e.length<2){alert("タイムテーブルを生成するには、最低2つのバンドが必要です。");return}re(Y,t,e,Ut)}function Ie(t,e,n){const a=D("bands",[]);St=a,vt=t;const s=le(e);try{rt=be(a,{distinguishGuitar:n,freeLeave:!1,costWeights:t,constraints:s},5)}catch(o){alert(`最適化エラー: ${o.message}`);return}jt(Y,rt,a,t,Z,gt)}function gt(t){yt=t;const e=St||D("bands",[]);ye(Y,t.details,e,t.cost,()=>{rt&&vt?jt(Y,rt,e,vt,Z,gt):Z()},n=>{$("schedule",n),Yt(n)})}function Yt(t){const e=D("timing",{minUnit:5,transitionTime:5,startTime:"12:00"}),n=St||D("bands",[]);Ee(Y,t,e,()=>{yt?gt(yt):Z()},n)}document.addEventListener("themis:generate",t=>{const{costWeights:e,rules:n,distinguishGuitar:a}=t.detail;Ie(e,n,a)});document.addEventListener("themis:scheduleReady",t=>{const{schedule:e}=t.detail;Yt(e)});Ut();
