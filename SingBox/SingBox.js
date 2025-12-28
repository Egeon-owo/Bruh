const { type, name } = $arguments
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible
let config = JSON.parse($files[0])
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

config.outbounds.push(...proxies)

// 定义正则常量，方便维护
// 1. HB 分组正则 (注意: / 需要转义为 \/)
const hbRegex = /家宽|HKT|HKBN|i-Cable|HGC|Hinet|Apol|SeedNet|Singtel|CTM|SoftBank|KDDI|Sonet|Biglobe|SK|KT|LG|Sejong|Verizon|AT&T|Comcast|Frontier|Videotron|\bBT(?!下载)\b|Vodafone|Video-Broadcast|Turk Telekom|Telekom Malaysia\/TM|VNPT|DIGI|JSC Kazakhtelecom|CAFE|Tunisietelecom|Umnia|Starlink/i;

// 2. F 分组正则 (匹配 0.1, 0.2 等倍率，且前后不跟随数字)
const fRegex = /(?<!\d)(0\.1|0\.2|0\.3|0\.5)(?!\d)/;

config.outbounds.map(i => {
  // --- 修改点 1: E 和 G 组匹配所有节点 ---
  if (['E', 'G'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }

  // --- 修改点 2: HB 组匹配特定ISP ---
  if (['HB'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, hbRegex))
  }

  // --- 修改点 3: F 组匹配特定倍率 ---
  if (['F'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, fRegex))
  }

  // --- 保留原有的地区分组逻辑 (如果不想要可以删除以下内容) ---
  if (['hk', 'hk-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, 🇭🇰))
  }
  if (['tw', 'tw-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, 🇨🇳))
  }
  if (['jp', 'jp-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, 🇯🇵))
  }
  if (['sg', 'sg-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, 🇸🇬))
  }
  if (['us', 'us-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, 🇺🇸))
  }
})

// 兜底逻辑：防止空分组报错
config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound)
      compatible = true
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2)

function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}
