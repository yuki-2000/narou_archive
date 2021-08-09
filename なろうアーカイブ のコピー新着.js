//なろうapiにアクセスして新着順500取得する。
function get_narou(mode){

  var now = new Date();  
  var date = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyyMMdd');
  var day = date + '-' + mode;
  Logger.log(day);
  var payload = "?" + 'out=json'+ "&" + 'gzip=0'  + "&" + "of=n&lim=500&order=new";
  Logger.log(payload);

  var url = "https://api.syosetu.com/novelapi/api/" + payload;
  Logger.log(url);

  var responseDataGET = UrlFetchApp.fetch(url).getContentText('UTF-8');
  Logger.log(responseDataGET);


  var contentJson = JSON.parse(responseDataGET);
  return contentJson;
}





//保存したいurlを入力するとwaybackに変換して登録
function wayback(url){
  var pdf_url = 'https://web.archive.org/save/'+url;
  Logger.log(pdf_url);
  var options = {
    "muteHttpExceptions": true,　    // 404エラーでも処理を継続する
  };
  var responseDataGET2 = UrlFetchApp.fetch(pdf_url, options);
  var code = responseDataGET2.getResponseCode();
  Logger.log(code);
  //Logger.log(responseDataGET2.getContentText('UTF-8'));
  Logger.log("--------------------------------------------")

}


//ver1
//一連の動作
function narou_wayback1(mode){
  contentJson=get_narou(mode);
  for (let i=0; i<contentJson.length; i++){
    var url = "https://pdfnovels.net/" + contentJson[i].ncode +"/main.pdf";
    Logger.log(i+ "番目 "+ contentJson[i].ncode);
    wayback(url);
  }
}





//ver2
//6分で自動的にできなくなってしまうので、5分経ったら途中から実行しなおすようにした。
function narou_wayback(mode){
  var start_time = new Date();
  var properties = PropertiesService.getScriptProperties();
  var number = parseInt(properties.getProperty("number"));
  
  contentJson=get_narou(mode);

  for (let i=number; i<contentJson.length; i++){

    var current_time = new Date();
    var difference = parseInt((current_time.getTime() - start_time.getTime()) / (1000 * 60));
    // スクリプトプロパティの更新
    properties.setProperty("number",i);
    
    if(difference >= 4){


      
      //もう一度動かす
      ScriptApp
      .newTrigger(func_name)
      .timeBased()
      .after(10 * 1000)
      .create();
      return;
    }else{

      var url = "https://pdfnovels.net/" + contentJson[i].ncode +"/main.pdf";
      Logger.log(i+ "番目 "+ contentJson[i].ncode);
      wayback(url);
    }
  }

  properties.setProperty("number",1);

}





//pdfを作成中です、がアーカイブされてしまうことがあるので、あらかじめアクセスしておく
//1秒1アクセスぽいので300こで6分の壁は大丈夫かな
function make_pdf(){
  contentJson = get_narou("d");
  for (let i=0; i<contentJson.length; i++){
    var url = "https://pdfnovels.net/" + contentJson[i].ncode +"/main.pdf";
    var options = {
    "muteHttpExceptions": true,　    // 404エラーでも処理を継続する
    };
    let res = UrlFetchApp.fetch(url, options);
    let code = res.getResponseCode();
    Logger.log(i + "番目");
    Logger.log(url);
    Logger.log(code);
  }
}







// 特定関数のトリガーを全て削除
function delete_specific_triggers( name_function ){
  var all_triggers = ScriptApp.getProjectTriggers();

  for( var i = 0; i < all_triggers.length; ++i ){
    if( all_triggers[i].getHandlerFunction() == name_function )
      ScriptApp.deleteTrigger(all_triggers[i]);
  }//for_i
}//func_deleteSpecificTriggers






//https://qiita.com/s_maeda_fukui/items/d194c6408803229fe1b9
//modeは日間の場合はd,週間の場合はw,月間の場合はmが、四半期の場合はqが入ります。

//+制約+
//・2013年5月1日以降の日付を指定してください。
//・週間を取得する場合、日付は火曜日の日付を指定してください。
//・月間、四半期を取得する場合、日付は1日を指定してください。

//また、「小説を読もう！で公開しているランキング」の日間ランキングは1日3回更新されていますが、このAPIでは午前4時～午前7時に作成した日間ランキングのみを蓄積しAPIで提供しています。 予めご了承願います。
function day(){
  func_name = "day_mirror";
  delete_specific_triggers(func_name)
  narou_wayback("d");
}

//triggerが溜まってきてしまうので、削除するトリガーと起動するトリガーをわけた
function day_mirror(){
  func_name = "day_mirror";
  delete_specific_triggers(func_name)
  narou_wayback("d");
}

