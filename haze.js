//创建地图对象
var map = new AMap.Map("Map", {
  resizeEnable: true,
  center: [116.397428, 39.90923],
  zoom: 13
});

//获取用户所在城市信息
//实例化城市查询类
var citysearch = new AMap.CitySearch();
//自动获取用户IP，返回当前城市
citysearch.getLocalCity(function (status, result) {
  if (status === 'complete' && result.info === 'OK')
    if (result && result.city && result.bounds) {
      var cityinfo = result.city;
      var citybounds = result.bounds;
      document.getElementById('City').innerHTML = cityinfo;
      //地图显示当前城市
      map.setBounds(citybounds);
      Weather(cityinfo);
    }
  else {
    document.getElementById('City').innerHTML = result.info;
  }
});


// 天气实况和天气预报
function Weather(city) {
  // 空气质量数据
  $.ajax({
    url: "https://free-api.heweather.net/s6/air/now", //请求接口的地址
    type: "GET", //请求的方法GET/POST
    data: { //需要传递的参数
      location: city,
      key: 'cd72f99eca4943a98e19ff8a3f557f67',
    },
    success: function (res) { //请求成功后的操作
      var data = eval(res);
      air = data.HeWeather6[0].air_now_city;
      var strAQI = [];
      var strTime = [];
      strAQI.push('AQI：' + air.aqi);
      strAQI.push('主要污染物：' + air.main);
      strAQI.push('空气质量：' + air.qlty);
      strAQI.push('PM10：' + air.pm10);
      strAQI.push('PM2.5：' + air.pm25);
      strAQI.push('二氧化氮：' + air.no2);
      strAQI.push('二氧化硫：' + air.so2);
      strAQI.push('一氧化碳：' + air.co);
      strAQI.push('臭氧：' + air.o3);
      strTime.push('数据发布时间：' + air.pub_time);
      document.getElementById("AQI").innerHTML = strAQI.join('<br>');
      document.getElementById("submitTime").innerHTML = strTime;
      console.log(res); //在控制台输出返回结果
    },
    error: function (err) { //请求失败后的操作
      console.log(err.message); //请求失败在控制台输出message
    }
  });

  // 常规天气数据
  $.ajax({
    url: "https://free-api.heweather.net/s6/weather", //请求接口的地址
    type: "GET", //请求的方法GET/POST
    data: { //需要传递的参数
      location: city,
      key: '2e8fc91c32804db88383da8ab482d69b',
    },
    success: function (res) { //请求成功后的操作
      var data = eval(res);
      basic = data.HeWeather6[0].basic;
      var strBasic = [];
      strBasic.push('纬度：' + basic.lat);
      strBasic.push('经度：' + basic.lon);
      document.getElementById("Basic").innerHTML = strBasic.join('<br>');

      now = data.HeWeather6[0].now;
      var strNow = [];
      strNow.push('体感温度：' + now.fl + '℃');
      strNow.push('温度：' + now.tmp + '℃');
      strNow.push('实况天气状况：' + now.cond_txt);
      strNow.push('风向风力：' + now.wind_dir + now.wind_sc + '级');
      strNow.push('相对湿度：' + now.hum + '%');
      strNow.push('降水量：' + now.pcpn + 'mm');
      strNow.push('大气压强：' + now.pres + 'Pa');
      strNow.push('能见度：' + now.vis + 'km');
      strNow.push('云量：' + now.cloud);
      document.getElementById("Now").innerHTML = strNow.join('<br>');

      forecast = data.HeWeather6[0].daily_forecast
      for (var i = 0; i < 3; i++) {
        var strForecast = [];
        strForecast.push(forecast[i].date);
        strForecast.push('日出时间：' + forecast[i].sr);
        strForecast.push('日落时间：' + forecast[i].ss);
        strForecast.push('月升时间：' + forecast[i].mr);
        strForecast.push('月落时间：' + forecast[i].ms);
        strForecast.push('最高温度：' + forecast[i].tmp_max + '℃');
        strForecast.push('最低温度：' + forecast[i].tmp_min + '℃');
        strForecast.push('相对湿度：' + forecast[i].hum + '%');
        strForecast.push('白天天气：' + forecast[i].cond_txt_d);
        strForecast.push('夜晚天气：' + forecast[i].cond_txt_n);
        strForecast.push('风向风力：' + forecast[i].wind_dir + forecast[i].wind_sc + '级');
        strForecast.push('降水量：' + forecast[i].pcpn + 'mm');
        strForecast.push('降水概率：' + forecast[i].pop + '%');
        strForecast.push('大气压强：'+forecast[i].pres+'Pa');
        strForecast.push('紫外线强度指数：'+forecast[i].uv_index+'级');
        strForecast.push('能见度：' + forecast[i].vis + 'km');
        document.getElementById("Forecast" + i).innerHTML = strForecast.join('<br>');
      }

      // 用于画图的对象
      var Obj = {
        id: "Chart",
        width: 500,
        height: 300,
        datas: [{
            name: "最高温度",
            color: "red",
            data: [forecast[0].tmp_max, forecast[1].tmp_max, forecast[2].tmp_max],
          },
          {
            name: "最低温度",
            color: "blue",
            data: [forecast[0].tmp_min, forecast[1].tmp_min, forecast[2].tmp_min]
          },
          {
            name: "相对湿度",
            color: "green",
            data: [forecast[0].hum, forecast[1].hum, forecast[2].hum]
          },

        ],
        startX: 50,
        startY: 250,
        labelColor: "black",
        labelCount: 10,
        nameSpace: 80,
        circleColor: "blue",
        tip: "温度湿度折线图"
      };
      // 画图
      drawLine(Obj);
    },
    error: function (err) { //请求失败后的操作
      console.log(err.message); //请求失败在控制台输出message
    }
  })

  // 绘制折线图
  function drawLine(Obj) {
    var id = Obj.id;
    var datas = Obj.datas;
    var width = Obj.width;
    var height = Obj.height;
    var startX = Obj.startX;
    var startY = Obj.startY;
    var labelColor = Obj.labelColor;
    var labelCount = Obj.labelCount;
    var nameSpace = Obj.nameSpace;
    var tip = Obj.tip;
    var circleColor = Obj.circleColor;

    var container = document.getElementById(id);
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    // canvas.style.border = "1px solid red";
    container.appendChild(canvas);
    var cvs = canvas.getContext("2d");
    cvs.beginPath();
    cvs.strokeStyle = "black";
    var startY1 = 50;
    cvs.moveTo(startX, startY1);
    cvs.lineTo(startX, startY);
    cvs.lineTo(1200, startY);
    cvs.stroke();
    var length = datas.length;
    var length1 = datas[0].data.length;
    var maxNum = 0;
    for (var i = 0; i < length; i++)
      for (var j = 0; j < length1; j++)
        if (maxNum <= datas[i].data[j])
          maxNum = datas[i].data[j];
    maxNum = maxNum * 1.1;
    var increment = (startY - startY1) / maxNum;
    var labelSpace = (startY - startY1) / labelCount;
    for (var i = 0; i <= labelCount; i++) {
      var text = Math.round((maxNum / labelCount) * i);
      cvs.beginPath();
      cvs.fillStyle = labelColor;
      cvs.fillText(text, startX - 40, startY - (labelSpace * i));
      cvs.closePath();
      cvs.fill();
    }

    var start = 0;
    var end = 0;
    var titleSpace = 30;

    for (let i = 0; i < length; i++) {
      var k = 100;
      for (let j = 0; j < length1; j++) {
        //折线
        setTimeout(function () {
          cvs.beginPath();
          cvs.strokeStyle = datas[i].color;
          cvs.moveTo(startX + nameSpace * (j + 1), (startY1 + (maxNum - datas[i].data[j]) * increment));
          cvs.lineTo(startX + nameSpace * (j + 2), (startY1 + (maxNum - datas[i].data[j + 1]) * increment));
          cvs.stroke();
        }, k += 100);

        end = length1 * (i + 1);
        start = i * length1;
        //圆点
        cvs.beginPath();
        cvs.fillStyle = circleColor;
        cvs.arc(startX + nameSpace * (j + 1), (startY1 + (maxNum - datas[i].data[j]) * increment), 4, 0, Math.PI * 2)
        cvs.closePath();
        cvs.fill();
      }
      cvs.beginPath();
      cvs.strokeStyle = datas[i].color;
      cvs.moveTo(100, 40 + titleSpace * i);
      cvs.lineTo(100, 40 + titleSpace * i);
      cvs.stroke();
      cvs.closePath();

      cvs.beginPath();
      cvs.fillStyle = datas[i].color;
      cvs.font = "15px 黑体";
      cvs.fillText(datas[i].name, 1130, 45 + titleSpace * i);
      cvs.stroke();
      cvs.closePath();
    }
    cvs.beginPath();
    cvs.fillStyle = labelColor;
    cvs.fillText(tip, 20, 30);
    cvs.closePath();
    cvs.fill();
    for (var k = 0; k < length1; k++) {
      cvs.beginPath();
      cvs.fillStyle = labelColor;
      cvs.fillText("后" + (k + 1) + "天", startX + nameSpace * (k + 1) - 10, startY + 30);
      cvs.closePath();
      cvs.fill();
    }
  }
}