/**
 * FiveM Lua-fork → standard Lua 5.4 source transformer.
 *
 * FiveM's server runs a FORK of Lua 5.4 (see the fivem repo,
 * code/components/citizen-scripting-lua — vendored lua54 with cfx patches)
 * whose extra syntax is used all over real resources:
 *
 *   1. backtick identifiers:  [`weapon_unarmed`] = ..., obj.`end`
 *   2. compound assignment:   count += 1, t.x -= 2, s ..= 'a'
 *   3. safe navigation:       getmetatable(val)?.__call, a?.b.c
 *
 * wasmoon ships STANDARD Lua 5.4, so we rewrite all three to plain Lua before
 * loading. The scanner is string/comment aware, so literals containing
 * backticks, '+=' or '?.' are never touched.
 */

// Split source into segments: { text, code: true|false } — code segments are
// safe to rewrite; literal/comment segments are copied verbatim.
export function segmentLua(src) {
  const segs = [];
  let i = 0, n = src.length, buf = '';
  const pushCode = () => { if (buf) { segs.push({ text: buf, code: true }); buf = ''; } };

  while (i < n) {
    const c = src[i], c2 = src[i + 1];

    // comments
    if (c === '-' && c2 === '-') {
      const m = /^--\[(=*)\[/.exec(src.slice(i));
      if (m) {
        const close = ']' + m[1] + ']';
        const end = src.indexOf(close, i + m[0].length);
        const stop = end === -1 ? n : end + close.length;
        pushCode(); segs.push({ text: src.slice(i, stop), code: false });
        i = stop; continue;
      }
      const end = src.indexOf('\n', i);
      const stop = end === -1 ? n : end;
      pushCode(); segs.push({ text: src.slice(i, stop), code: false });
      i = stop; continue;
    }

    // long strings [[...]] / [=[...]=]
    if (c === '[' && (c2 === '[' || c2 === '=')) {
      const m = /^\[(=*)\[/.exec(src.slice(i));
      if (m) {
        const close = ']' + m[1] + ']';
        const end = src.indexOf(close, i + m[0].length);
        const stop = end === -1 ? n : end + close.length;
        pushCode(); segs.push({ text: src.slice(i, stop), code: false });
        i = stop; continue;
      }
    }

    // quoted strings
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === '\\') j += 2;
        else if (src[j] === c || src[j] === '\n') { j++; break; }
        else j++;
      }
      pushCode(); segs.push({ text: src.slice(i, j), code: false });
      i = j; continue;
    }

    buf += c;
    i++;
  }
  pushCode();
  return segs;
}

// 1) backticks:  [`name`] -> ['name']   (table key form)
//                `name`   -> _cfxbt_name (identifier form, consistent mangling)
function rewriteBackticks(code) {
  code = code.replace(/\[`([A-Za-z_][A-Za-z0-9_]*)`\]/g, "['$1']");
  code = code.replace(/`([A-Za-z_][A-Za-z0-9_]*)`/g, '_cfxbt_$1');
  return code;
}

// 2) safe navigation:  a?.b.c  ->  (a and a.b.c)
// Runs on the FULL source (an LHS can span string-literal boundaries, e.g.
// debug.getinfo(idx, 'S')?.source), but skips any '?.' that sits inside a
// string/comment. The LHS extent is found by walking backward from '?.',
// bracket-matching calls and indexes.
function rewriteSafeNavFull(src) {
  let code = src;
  for (let pass = 0; pass < 100; pass++) {
    // locate the first '?.' that is in CODE (not in a literal/comment)
    const segs = segmentLua(code);
    let q = -1;
    let off = 0;
    for (const s of segs) {
      if (s.code) {
        const k = s.text.indexOf('?.');
        if (k !== -1) { q = off + k; break; }
      }
      off += s.text.length;
    }
    if (q === -1) break;

    // walk backward over the LHS expression
    let i = q - 1, depth = 0;
    while (i >= 0) {
      const c = code[i];
      if (c === ')' || c === ']') { depth++; i--; continue; }
      if (c === '(' || c === '[') {
        if (depth === 0) break;
        depth--; i--; continue;
      }
      if (depth > 0) { i--; continue; }
      if (/[A-Za-z0-9_]/.test(c)) { i--; continue; }
      if (c === '.') { i--; continue; }
      break;
    }
    const lhsStart = i + 1;
    const m = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*/.exec(code.slice(q + 2));
    if (!m || !m[0] || lhsStart >= q) {
      // unknown form — neutralize this '?.' so we cannot loop forever
      code = code.slice(0, q) + '. ' + code.slice(q + 2);
      continue;
    }
    const tail = m[0];
    const lhs = code.slice(lhsStart, q);
    code = code.slice(0, lhsStart) + `(${lhs} and ${lhs}.${tail})` + code.slice(q + 2 + tail.length);
  }
  return code;
}

// 3) compound assignment, per line, within a code segment:
//    lhs += rhs  ->  lhs = lhs + (rhs)
function rewriteCompoundLines(code) {
  const lines = code.split('\n');
  const fixed = lines.map((line) => {
    let res = line;
    for (const opRaw of ['..', '+', '-', '*', '/', '%', '//']) {
      const opRx = new RegExp('(^|[;\\{\\}]\\s*|[\\s\\)])([A-Za-z_][A-Za-z0-9_.\\[\\]\'"() ]*?)\\s*' +
        opRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=\\s*(.+)$');
      const m = opRx.exec(res);
      if (!m) continue;
      const lead = m[1] || '';
      const lhs = m[2];
      const rhs = m[3];
      if (!lhs.trim()) continue;
      if (!/^[A-Za-z_][A-Za-z0-9_]*\s*([.:\[][\s\S]*)?$/.test(lhs.trim())) continue;
      const comment = (rhs.match(/\s+--.*$/) || [''])[0];
      const rhsBody = rhs.replace(/\s+--.*$/, '');
      res = `${lead}${lhs} = ${lhs} ${opRaw} (${rhsBody})${comment}`;
      break;
    }
    return res;
  });
  return fixed.join('\n');
}

export function transformFiveMLua(src) {
  // safe navigation first, on the full text (string-aware)
  let code = rewriteSafeNavFull(src);
  // backticks + compound per code segment
  const segs = segmentLua(code);
  let out = '';
  for (const s of segs) {
    if (!s.code) { out += s.text; continue; }
    let c = rewriteBackticks(s.text);
    c = rewriteCompoundLines(c);
    out += c;
  }
  return out;
}
