# Regenerate the static study from the exact live model, including depth-buffer
# occlusion. Start npm run dev first. No project photos are edited by this script.
param(
  [string]$DevUrl = 'http://127.0.0.1:5173',
  [string]$ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe',
  [int]$DebugPort = 9293
)
$ErrorActionPreference = 'Stop'
$workspace = Split-Path $PSScriptRoot -Parent
$assetDir = Join-Path $workspace 'src/assets/studies'
$profile = Join-Path $workspace ('.tmp/study-render-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $assetDir, $profile | Out-Null
$chrome = Start-Process $ChromePath -ArgumentList '--headless=new','--disable-extensions',"--remote-debugging-port=$DebugPort",'--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run',('--user-data-dir="' + $profile + '"'),'about:blank' -WindowStyle Hidden -PassThru
$socket = [Net.WebSockets.ClientWebSocket]::new()
$script:messageId = 0
function Cdp($method, $parameters) {
  $script:messageId++
  $bytes = [Text.Encoding]::UTF8.GetBytes((@{id=$script:messageId;method=$method;params=$parameters}|ConvertTo-Json -Depth 20 -Compress))
  $socket.SendAsync([ArraySegment[byte]]::new($bytes),[Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult()|Out-Null
  do {
    $buffer = New-Object byte[] 65536
    $stream = [IO.MemoryStream]::new()
    do {
      $read = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer),[Threading.CancellationToken]::None).GetAwaiter().GetResult()
      $stream.Write($buffer,0,$read.Count)
    } while (!$read.EndOfMessage)
    $reply = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
    $stream.Dispose()
  } while ($reply.id -ne $script:messageId)
  if ($reply.error) { throw ($reply.error | ConvertTo-Json) }
  return $reply.result
}
function Js($expression) {
  $result = Cdp 'Runtime.evaluate' @{expression=$expression;returnByValue=$true;awaitPromise=$true}
  if ($result.exceptionDetails) { throw ($result.exceptionDetails | ConvertTo-Json -Depth 5) }
  return $result.result.value
}
try {
  Start-Sleep -Seconds 2
  $tabs = Invoke-RestMethod "http://127.0.0.1:$DebugPort/json"
  $tab = $tabs | Where-Object {$_.type -eq 'page'} | Select-Object -First 1
  $socket.ConnectAsync([Uri]($tab.webSocketDebuggerUrl.Replace('localhost','127.0.0.1')),[Threading.CancellationToken]::None).GetAwaiter().GetResult()|Out-Null
  Cdp 'Runtime.enable' @{}|Out-Null
  Cdp 'Emulation.setDeviceMetricsOverride' @{width=1440;height=1000;deviceScaleFactor=1;mobile=$false}|Out-Null
  Cdp 'Emulation.setEmulatedMedia' @{features=@(@{name='prefers-reduced-motion';value='no-preference'})}|Out-Null
  Cdp 'Page.navigate' @{url=($DevUrl.TrimEnd('/') + '/#/approach')}|Out-Null
  $ready = $false
  for ($attempt=0;$attempt -lt 80;$attempt++) {
    Start-Sleep -Milliseconds 250
    if (Js "!!document.getElementById('renovation-details')") {$ready=$true;break}
  }
  if (!$ready) { throw 'Approach did not load. Start the Vite dev server first.' }
  Js "(async()=>{const el=document.getElementById('renovation-details');const m=await import('/src/hooks/useLenis.ts');const y=el.getBoundingClientRect().top+scrollY-90;const l=m.getLenis();if(l)l.scrollTo(y,{immediate:true});else scrollTo({top:y,behavior:'instant'});return true})()"|Out-Null
  $ready = $false
  for ($attempt=0;$attempt -lt 80;$attempt++) {
    Start-Sleep -Milliseconds 250
    if (Js "!!document.querySelector('#renovation-details canvas')") {$ready=$true;break}
  }
  if (!$ready) { throw 'The live study did not mount. WebGL must be available for asset generation.' }
  Start-Sleep -Seconds 2
  foreach ($focus in @('neutral','original','connection','outdoors')) {
    $expression = @'
(async()=>{
  const focus='__FOCUS__';
  const F=await import('/node_modules/.vite/deps/@react-three_fiber.js');
  const T=await import('/node_modules/.vite/deps/three.js');
  const m=await import('/src/three/heritageMaquette.ts');
  const canvas=document.querySelector('#renovation-details canvas');
  const root=F._roots.get(canvas);
  if(!root)throw new Error('Live canvas root not found');
  const {gl,scene,camera}=root.store.getState();
  let meshes=0;
  scene.traverse(object=>{
    if(!object.isMesh||!object.name.startsWith('study-'))return;
    const [key,groups]=object.name.slice(6).split('|');
    const selected=groups.split(' ').includes(focus);
    object.material.color.set(selected?m.MAQUETTE_FOCUS_COLOURS[key]:m.MAQUETTE_MATERIALS[key].color);
    meshes++;
  });
  if(!meshes)throw new Error('Study material batches missing');
  const oldFrame={left:camera.left,right:camera.right,top:camera.top,bottom:camera.bottom};
  const width=1800,height=Math.round(width/m.HERITAGE_MAQUETTE_ASPECT);
  const frame=m.heritageMaquetteFrame(width/height);
  const target=new T.WebGLRenderTarget(width,height,{samples:4});
  target.texture.colorSpace=T.SRGBColorSpace;
  camera.left=-frame.width/2;camera.right=frame.width/2;
  camera.top=frame.height/2;camera.bottom=-frame.height/2;camera.updateProjectionMatrix();
  gl.setRenderTarget(target);
  gl.render(scene,camera);
  const pixels=new Uint8Array(width*height*4);
  gl.readRenderTargetPixels(target,0,0,width,height,pixels);
  gl.setRenderTarget(null);target.dispose();
  Object.assign(camera,oldFrame);camera.updateProjectionMatrix();
  const output=document.createElement('canvas');output.width=width;output.height=height;
  const context=output.getContext('2d');const bitmap=context.createImageData(width,height);
  for(let y=0;y<height;y++)bitmap.data.set(pixels.subarray((height-1-y)*width*4,(height-y)*width*4),y*width*4);
  context.putImageData(bitmap,0,0);
  const result=output.toDataURL('image/webp',0.96);
  if(!result.startsWith('data:image/webp;base64,'))throw new Error('WebP export failed');
  return result.split(',')[1];
})()
'@
    $data = Js ($expression.Replace('__FOCUS__',$focus))
    $target = Join-Path $assetDir ("auchenflower-study-$focus.webp")
    [IO.File]::WriteAllBytes($target,[Convert]::FromBase64String($data))
    Write-Output ("Rendered $focus (" + (Get-Item -LiteralPath $target).Length + ' bytes)')
  }
} finally {
  $socket.Dispose()
  Stop-Process -Id $chrome.Id -ErrorAction SilentlyContinue
}
