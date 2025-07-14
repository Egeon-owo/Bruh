/**
 * 将所有 safety host 请求，剥离域名后原样重定向
 */
let original = $request.url.replace(/^https?:\/\/www\.tiktoklinksafety\.com\//, '');
$done({
  status: 302,
  headers: { "Location": original }
});