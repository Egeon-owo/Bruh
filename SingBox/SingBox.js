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

// --- 定义正则常量 ---

// 1. HB 分组正则
const hbRegex = /家宽|HKT|HKBN|i-Cable|HGC|Hinet|Apol|SeedNet|Singtel|CTM|SoftBank|KDDI|Sonet|Biglobe|SK|KT|LG|Sejong|Verizon|AT&T|Comcast|Frontier|Videotron|\bBT(?!下载)\b|Vodafone|Video-Broadcast|Turk Telekom|Telekom Malaysia\/TM|VNPT|DIGI|JSC Kazakhtelecom|CAFE|Tunisietelecom|Umnia|Starlink/i;

// 2. F 分组正则 (倍率匹配)
const fRegex = /(?<!\d)(0\.1|0\.2|0\.3|0\.5)(?!\d)/;

// 3. EU 分组正则 (新增：包含所有欧洲及周边国家旗帜)
const euRegex = /🇪🇺|🇮🇪|🇪🇪|🇦🇹|🇧🇬|🇧🇪|🇵🇱|🇩🇰|🇩🇪|🇫🇷|🇫🇮|🇨🇿|🇭🇷|🇱🇻|🇱🇹|🇱🇺|🇵🇹|🇸🇪|🇪🇸|🇬🇷|🇮🇹|🇨🇾|🇭🇺|🇲🇹|🇳🇱|🇷🇴|🇸🇰|🇸🇮|🇨🇭|🇳🇴|🇮🇸|🇱🇮|🇲🇨|🇸🇲|🇻🇦|🇦🇩|🇺🇦|🇧🇾|🇲🇩|🇷🇸|🇧🇦|🇲🇪|🇲🇰|🇦🇱|🇬🇧|🇷🇺|🇹🇷/;

config.outbounds.forEach(i => {
  // --- E 和 G 组匹配所有节点 ---
  if (['E', 'G'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }

  // --- HB 组匹配特定ISP ---
  if (['HB'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, hbRegex))
  }

  // --- F 组匹配特定倍率 ---
  if (['F'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, fRegex))
  }

  // --- EU 组匹配欧洲节点 (新增逻辑) ---
  if (['EU'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, euRegex))
  }

  // --- 地区分组逻辑 ---
  if (['HK'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /🇭🇰/))
  }
  if (['TW'].includes(i.tag)) {
    // 这里保留了 🇹🇼 和 🇨🇳 以防万一，如果你只想匹配台湾旗帜，可删掉 "|🇨🇳"
    i.outbounds.push(...getTags(proxies, /🇹🇼|🇨🇳/))
  }
  if (['JP'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /🇯🇵/))
  }
  if (['SG'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /🇸🇬/))
  }
  if (['US'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /🇺🇸/))
  }
})

// 兜底逻辑
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
