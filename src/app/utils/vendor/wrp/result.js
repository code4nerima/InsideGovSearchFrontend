const Result = (function () {
  var result_ = {
    version: 'Result/1.0.04',
    parse: parse_,
    parseJSON: parseJSON_,
    parseTEXT: parseTEXT_,
    parseRAW: parseRAW_,
  }

  function parse_(result) {
    try {
      return parseJSON_(result)
    } catch (e) {
      if (result.indexOf('\x01') == -1) {
        return parseTEXT_(result)
      } else {
        return parseRAW_(result)
      }
    }
  }

  function parseJSON_(result) {
    var json = JSON.parse(result)
    json.duration =
      json.results && json.results[0] ? json.results[0].endtime : 0
    json.confidence =
      json.results && json.results[0] ? json.results[0].confidence : -1.0
    return json
  }

  function parseTEXT_(result) {
    return {
      text: result,
      duration: 0,
      confidence: -1.0,
      code: '',
      message: '',
    }
  }

  function parseRAW_(result) {
    var local = {
      buffer: '',
      bufferEnding: 0,
    }
    var fields = result.split('\x01')
    var fields0 = fields[0].split('|')
    var i, j
    for (i = 0; i < fields0.length; i++) {
      var written = fields0[i]
      if ((j = written.indexOf(' ')) != -1) {
        written = written.slice(0, j)
      }
      if ((j = written.indexOf(':')) != -1) {
        written = written.slice(0, j)
      }
      if ((j = written.indexOf('\x03')) != -1) {
        written = written.slice(0, j)
      }
      append_(local, written)
    }
    return {
      text: local.buffer,
      duration: fields[2] ? parseInt(fields[2].split('-')[1]) : 0,
      confidence: fields[1] ? parseFloat(fields[1]) : -1.0,
      code: '',
      message: '',
    }
  }

  function append_(local, item) {
    if (item.length == 0) {
      return
    }
    if (item == '<->') {
      return
    }
    var itemState = 0
    for (var i = 0; i < item.length; i++) {
      var c = item.charCodeAt(i)
      if (itemState == 0) {
        if (c == 0x005f) {
          break
        } else if (
          c == 0x4e00 ||
          c == 0x4e8c ||
          c == 0x4e09 ||
          c == 0x56db ||
          c == 0x4e94 ||
          c == 0x516d ||
          c == 0x4e03 ||
          c == 0x516b ||
          c == 0x4e5d
        ) {
          // '一'～'九'
          itemState = 1
        } else if (c == 0x5341) {
          // '十'
          itemState = 2
        } else if (c == 0x767e) {
          // '百'
          itemState = 4
        } else if (c == 0x5343) {
          // '千'
          itemState = 8
        } else {
          break
        }
      } else {
        if (c == 0x005f) {
          item = item.substr(0, i) + item.substr(i + 1)
          break
        } else if (
          c == 0x4e00 ||
          c == 0x4e8c ||
          c == 0x4e09 ||
          c == 0x56db ||
          c == 0x4e94 ||
          c == 0x516d ||
          c == 0x4e03 ||
          c == 0x516b ||
          c == 0x4e5d
        ) {
          // '一'～'九'
          if ((itemState & 1) != 0) {
            break
          } else {
            itemState |= 1
          }
        } else if (c == 0x5341) {
          // '十'
          if ((itemState & 2) != 0) {
            break
          } else {
            itemState |= 2
            itemState &= ~1
          }
        } else if (c == 0x767e) {
          // '百'
          if ((itemState & 6) != 0) {
            break
          } else {
            itemState |= 4
            itemState &= ~1
          }
        } else if (c == 0x5343) {
          // '千'
          if ((itemState & 14) != 0) {
            break
          } else {
            itemState |= 8
            itemState &= ~1
          }
        } else {
          break
        }
      }
    }
    item = item.replace(/_/g, ' ')
    var itemBeginningChar = item.charCodeAt(0)
    var itemEndingChar = item.length > 1 ? item.charCodeAt(item.length - 1) : 0
    if (local.bufferEnding == 0) {
      var itemBeginning
      var c = itemBeginningChar
      if (c == 0x0020) {
        itemBeginning = 0
      } else if (
        c == 0x0021 ||
        c == 0x002c ||
        c == 0x002e ||
        c == 0x003a ||
        c == 0x003b ||
        c == 0x003f
      ) {
        itemBeginning = 5
      } else if (
        c == 0x3001 ||
        c == 0x3002 ||
        c == 0xff01 ||
        c == 0xff0c ||
        c == 0xff0e ||
        c == 0xff1a ||
        c == 0xff1b ||
        c == 0xff1f
      ) {
        itemBeginning = 6
      } else {
        itemBeginning = 7
      }
      if (itemBeginning == 0 || itemBeginning == 5 || itemBeginning == 6) {
        if (local.buffer.length > 0) {
          local.buffer = local.buffer.substr(0, local.buffer.length - 1)
        }
      }
    } else {
      var itemBeginning
      var c = itemBeginningChar
      if (c == 0x0020) {
        itemBeginning = 0
      } else if (
        (c >= 0x0041 && c <= 0x005a) ||
        (c >= 0x0061 && c <= 0x007a) ||
        (c >= 0x0100 && c <= 0x0dff) ||
        (c >= 0x0e60 && c <= 0x01ff)
      ) {
        itemBeginning = 1
      } else if ((c >= 0xff21 && c <= 0xff3a) || (c >= 0xff41 && c <= 0xff5a)) {
        itemBeginning = 2
      } else if (c >= 0x0030 && c <= 0x0039) {
        itemBeginning = local.bufferEnding == 8 && itemEndingChar == 0 ? 8 : 3
      } else if (c >= 0xff10 && c <= 0xff19) {
        itemBeginning = local.bufferEnding == 9 && itemEndingChar == 0 ? 9 : 4
      } else if (
        c == 0x0021 ||
        c == 0x002c ||
        c == 0x002e ||
        c == 0x003a ||
        c == 0x003b ||
        c == 0x003f
      ) {
        itemBeginning = 5
      } else if (
        c == 0x3001 ||
        c == 0x3002 ||
        c == 0xff01 ||
        c == 0xff0c ||
        c == 0xff0e ||
        c == 0xff1a ||
        c == 0xff1b ||
        c == 0xff1f
      ) {
        itemBeginning = 6
      } else {
        itemBeginning = 7
      }
      if (
        itemBeginning == 1 ||
        (local.bufferEnding == 1 &&
          (itemBeginning == 2 ||
            itemBeginning == 3 ||
            itemBeginning == 4 ||
            itemBeginning == 7)) ||
        (local.bufferEnding == 2 && itemBeginning == 2) ||
        (local.bufferEnding == 3 &&
          (itemBeginning == 3 || itemBeginning == 4)) ||
        (local.bufferEnding == 4 &&
          (itemBeginning == 3 || itemBeginning == 4)) ||
        (local.bufferEnding == 5 &&
          (itemBeginning == 2 ||
            itemBeginning == 3 ||
            itemBeginning == 4 ||
            itemBeginning == 7)) ||
        (local.bufferEnding == 8 &&
          (itemBeginning == 3 || itemBeginning == 4)) ||
        (local.bufferEnding == 9 && (itemBeginning == 3 || itemBeginning == 4))
      ) {
        local.buffer += ' '
      }
    }
    local.buffer += item
    c = itemEndingChar == 0 ? itemBeginningChar : itemEndingChar
    if (c == 0x0020) {
      local.bufferEnding = 0
    } else if (
      (c >= 0x0041 && c <= 0x005a) ||
      (c >= 0x0061 && c <= 0x007a) ||
      (c >= 0x0100 && c <= 0x0dff) ||
      (c >= 0x0e60 && c <= 0x01ff)
    ) {
      local.bufferEnding = 1
    } else if ((c >= 0xff21 && c <= 0xff3a) || (c >= 0xff41 && c <= 0xff5a)) {
      local.bufferEnding = 2
    } else if (c >= 0x0030 && c <= 0x0039) {
      local.bufferEnding = itemEndingChar == 0 ? 8 : 3
    } else if (c >= 0xff10 && c <= 0xff19) {
      local.bufferEnding = itemEndingChar == 0 ? 9 : 4
    } else if (
      c == 0x0021 ||
      c == 0x002c ||
      c == 0x002e ||
      c == 0x003a ||
      c == 0x003b ||
      c == 0x003f
    ) {
      local.bufferEnding = 5
    } else if (
      c == 0x3001 ||
      c == 0x3002 ||
      c == 0xff01 ||
      c == 0xff0c ||
      c == 0xff0e ||
      c == 0xff1a ||
      c == 0xff1b ||
      c == 0xff1f
    ) {
      local.bufferEnding = 6
    } else {
      local.bufferEnding = 7
    }
  }

  return result_
})()

export default Result
