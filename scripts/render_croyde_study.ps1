# Regenerate both fallback photographs of the Croyde model from its live Three
# renderer. Requires the local Vite server and Chrome; no photograph is edited.
param(
  [string]$DevUrl = 'http://127.0.0.1:5173',
  [string]$ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe',
  [int]$DebugPort = 9382,
  [string]$OutputDirectory = '',
  [double]$Progress = 1
)
$ErrorActionPreference = 'Stop'
$workspace = Split-Path $PSScriptRoot -Parent
$assetDir = if ($OutputDirectory) { $OutputDirectory } else { Join-Path $workspace 'src/assets/models' }
$profile = Join-Path $workspace ('.tmp/croyde-render-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $assetDir, $profile | Out-Null
$chrome = Start-Process $ChromePath -ArgumentList '--headless=new','--disable-extensions',"--remote-debugging-port=$DebugPort",'--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--no-first-run',('--user-data-dir="' + $profile + '"'),'about:blank' -WindowStyle Hidden -PassThru
$socket = [Net.WebSockets.ClientWebSocket]::new()
$script:messageId = 0
function Cdp($method, $parameters) {
  $script:messageId++
  $bytes = [Text.Encoding]::UTF8.GetBytes((@{id=$script:messageId;method=$method;params=$parameters}|ConvertTo-Json -Depth 20 -Compress))
  $timeout = [Threading.CancellationTokenSource]::new(45000)
  try {
    $socket.SendAsync([ArraySegment[byte]]::new($bytes),[Net.WebSockets.WebSocketMessageType]::Text,$true,$timeout.Token).GetAwaiter().GetResult()|Out-Null
    do {
      $buffer = New-Object byte[] 65536
      $stream = [IO.MemoryStream]::new()
      do {
        $read = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer),$timeout.Token).GetAwaiter().GetResult()
        $stream.Write($buffer,0,$read.Count)
      } while (!$read.EndOfMessage)
      $reply = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
      $stream.Dispose()
    } while ($reply.id -ne $script:messageId)
    if ($reply.error) { throw ($reply.error | ConvertTo-Json) }
    return $reply.result
  } finally { $timeout.Dispose() }
}
function Js($expression) {
  $result = Cdp 'Runtime.evaluate' @{expression=$expression;returnByValue=$true;awaitPromise=$true}
  if ($result.exceptionDetails) { throw ($result.exceptionDetails | ConvertTo-Json -Depth 8) }
  return $result.result.value
}
try {
  Start-Sleep -Seconds 2
  $tabs = Invoke-RestMethod "http://127.0.0.1:$DebugPort/json"
  $tab = $tabs | Where-Object {$_.type -eq 'page'} | Select-Object -First 1
  $socket.ConnectAsync([Uri]($tab.webSocketDebuggerUrl.Replace('localhost','127.0.0.1')),[Threading.CancellationToken]::None).GetAwaiter().GetResult()|Out-Null
  Cdp 'Runtime.enable' @{}|Out-Null
  Cdp 'Emulation.setDeviceMetricsOverride' @{width=1200;height=900;deviceScaleFactor=1;mobile=$false}|Out-Null
  Cdp 'Emulation.setEmulatedMedia' @{features=@(@{name='prefers-reduced-motion';value='no-preference'})}|Out-Null
  Cdp 'Page.navigate' @{url=($DevUrl.TrimEnd('/') + '/#/work')}|Out-Null
  Start-Sleep -Seconds 2
  foreach ($view in @('front','rear')) {
    $mount = @'
(async()=>{
  const React=await import('/node_modules/.vite/deps/react.js');
  const DOM=await import('/node_modules/.vite/deps/react-dom_client.js');
  const Model=await import('/src/three/TimberFrame.tsx');
  if(window.__croydeExportRoot){window.__croydeExportRoot.unmount();document.getElementById('croyde-export').remove();}
  const app=document.getElementById('root');if(app)app.style.display='none';
  const host=document.createElement('div');host.id='croyde-export';
  Object.assign(host.style,{position:'fixed',left:'0',top:'0',width:'1100px',height:'780px',background:'transparent'});
  document.body.appendChild(host);
  const root=(DOM.default??DOM).createRoot(host);window.__croydeExportRoot=root;
  root.render((React.default??React).createElement(Model.default,{progress:{current:__PROGRESS__},view:'__VIEW__',shadows:true}));
  return true;
})()
'@
    $progressText = $Progress.ToString([Globalization.CultureInfo]::InvariantCulture)
    Js ($mount.Replace('__VIEW__',$view).Replace('__PROGRESS__',$progressText))|Out-Null
    $ready=$false
    for($attempt=0;$attempt -lt 30;$attempt++) {
      Start-Sleep -Milliseconds 250
      if(Js "(async()=>{const F=await import('/node_modules/.vite/deps/@react-three_fiber.js');const c=document.querySelector('#croyde-export canvas');const r=c&&F._roots.get(c);const s=r?.store.getState();return !!s?.scene.getObjectByName('croyde-building')&&s.gl.info.render.calls>0})()"){$ready=$true;break}
    }
    if(!$ready){throw 'The Croyde renderer did not become ready.'}
    Start-Sleep -Milliseconds 800
    $capture = @'
(async()=>{
  const F=await import('/node_modules/.vite/deps/@react-three_fiber.js');
  const T=await import('/node_modules/.vite/deps/three.js');
  const canvas=document.querySelector('#croyde-export canvas');
  const {gl,scene,camera}=F._roots.get(canvas).store.getState();
  const width=1650,height=1170;
  const target=new T.WebGLRenderTarget(width,height,{samples:4});
  target.texture.colorSpace=T.SRGBColorSpace;
  gl.setRenderTarget(target);gl.render(scene,camera);
  const pixels=new Uint8Array(width*height*4);
  gl.readRenderTargetPixels(target,0,0,width,height,pixels);
  gl.setRenderTarget(null);target.dispose();
  const output=document.createElement('canvas');output.width=width;output.height=height;
  const context=output.getContext('2d');const bitmap=context.createImageData(width,height);
  for(let y=0;y<height;y++)bitmap.data.set(pixels.subarray((height-1-y)*width*4,(height-y)*width*4),y*width*4);
  context.putImageData(bitmap,0,0);
  const result=output.toDataURL('image/webp',0.96);
  if(!result.startsWith('data:image/webp;base64,'))throw new Error('WebP export failed');
  return result.split(',')[1];
})()
'@
    $data=Js $capture
    $filename = if ($view -eq 'front') { 'assembly-street.webp' } else { 'assembly-garden.webp' }
    $target=Join-Path $assetDir $filename
    [IO.File]::WriteAllBytes($target,[Convert]::FromBase64String($data))
    Write-Output ("Rendered $view at $Progress ("+(Get-Item -LiteralPath $target).Length+' bytes)')
  }
} finally {
  $socket.Dispose()
  Stop-Process -Id $chrome.Id -ErrorAction SilentlyContinue
}
