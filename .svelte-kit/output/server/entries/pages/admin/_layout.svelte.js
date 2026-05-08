import { b as attr, a as attr_class } from "../../../chunks/index2.js";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  let passwordInput = "";
  let isError = false;
  {
    $$renderer.push("<!--[!-->");
    $$renderer.push(`<div class="lock-screen svelte-1qg5d05"><div class="lock-box svelte-1qg5d05"><span class="icon svelte-1qg5d05">🔒</span> <h2 class="svelte-1qg5d05">Restricted Access</h2> <p class="svelte-1qg5d05">This area is for museum staff and developers.</p> <form><input type="password"${attr("value", passwordInput)} placeholder="Enter Admin PIN"${attr_class("svelte-1qg5d05", void 0, { "error": isError })}/> `);
    {
      $$renderer.push("<!--[!-->");
    }
    $$renderer.push(`<!--]--> <button type="submit" class="login-btn svelte-1qg5d05">Unlock</button></form></div></div>`);
  }
  $$renderer.push(`<!--]-->`);
}
export {
  _layout as default
};
