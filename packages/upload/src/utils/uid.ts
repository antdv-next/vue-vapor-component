const now = +new Date()
let index = 0

export default function getUid() {
  return `vc-upload-${now}-${++index}`
}
