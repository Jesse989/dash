import React, { Component } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import moment from 'moment'

am4core.useTheme(am4themes_animated);

interface dataYear {
    [prop: string]: Array<dataPoints>;
}

interface dataPoints {
    network: string,
    MAU: number
}

export interface stateDataDay {
    [prop: string]: Array<stateDataPoint>
}

export interface stateDataPoint {
    state: string,
    cases: number
}

export interface Props {
  data: stateDataDay;
}

class RaceChart extends Component<Props, {}> {
  chart: am4charts.XYChart | undefined;

  componentDidMount() {
    let chart = am4core.create("chartdiv", am4charts.XYChart);
    
    let title = chart.titles.create();
    title.text = "Confirmed Cases";
    title.fontSize = 25;
    title.marginBottom = 30;

    chart.padding(40, 40, 10, 40);

    chart.numberFormatter.bigNumberPrefixes = [
      { number: 1e3, suffix: "K" },
      { number: 1e6, suffix: "M" },
      { number: 1e9, suffix: "B" },
    ];

    let label = chart.plotContainer.createChild(am4core.Label);
    label.x = am4core.percent(97);
    label.y = am4core.percent(95);
    label.horizontalCenter = "right";
    label.verticalCenter = "middle";
    label.dx = -10;
    label.fontSize = 50;

    let playButton = chart.plotContainer.createChild(am4core.PlayButton);
    playButton.x = am4core.percent(97);
    playButton.y = am4core.percent(95);
    playButton.dy = -2;
    playButton.zIndex = 1000
    playButton.verticalCenter = "middle";
    playButton.events.on("toggled", function (event) {
      if (event.target.isActive) {
        play();
      } else {
        stop();
      }
    });

    let stepDuration = 2000;

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "state";
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.rangeChangeEasing = am4core.ease.linear;
    valueAxis.rangeChangeDuration = stepDuration;
    valueAxis.extraMax = 0.1;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = "state";
    series.dataFields.valueX = "cases";
    series.tooltipText = "{valueX.value}";
    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusBottomRight = 5;
    series.columns.template.column.cornerRadiusTopRight = 5;
    series.interpolationDuration = stepDuration;
    series.interpolationEasing = am4core.ease.linear;

    let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.horizontalCenter = "right";
    labelBullet.label.text =
      "{values.valueX.workingValue.formatNumber('#.0as')}";
    labelBullet.label.textAlign = "end";
    labelBullet.label.dx = -10;

    chart.zoomOutButton.disabled = true;

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
      if (target && target.dataItem)
        return chart.colors.getIndex(target.dataItem.index);
    });

    const startingDay = moment('01-22-2020', 'MM-DD-YYYY')
    const endingDay = moment('04-06-2020', 'MM-DD-YYYY')
    let day = startingDay;
    label.text = day.format('MMM Do').toString();
    label.zIndex = 100


    let interval: NodeJS.Timeout;

    function play() {
      interval = setInterval(function () {
        nextDay();
      }, stepDuration);
      nextDay();
    }

    function stop() {
      if (interval) {
        clearInterval(interval);
      }
    }

    function getPercentile(cases: stateDataPoint[]) {
        let max = 0
        let results = []
        for (let row of cases) {
          if (row.cases > max) {
              max = row.cases
          }
          results.push(row.cases)
        }
        const topHalf = results.sort((a, b) => b - a).slice(0, Math.floor(results.length/2))
        const topQuarter = topHalf.slice(0, Math.floor(topHalf.length/2))
        return topQuarter[topQuarter.length-1]
    }

    function nextDay() {
      // increment day
      day = moment(day).add(1, 'days');

      if (day > endingDay) {
        day = startingDay;
      }
      // find mean
      
      let newData = allData[day.format('MM-DD-YYYY').toString()];
      let percentile = getPercentile(newData)

      

      label.text = day.format('MMM Do').toString();

      if (!newData) return;
      let itemsWithNonZero = 0;
      for (var i = 0; i < chart.data.length; i++) {
        
        chart.data[i].cases = newData[i].cases;
        if (parseInt(chart.data[i].cases) > percentile) {
          itemsWithNonZero++;
        }
      }

      if (day === startingDay) {
        series.interpolationDuration = stepDuration / 4;
        valueAxis.rangeChangeDuration = stepDuration / 4;
      } else {
        series.interpolationDuration = stepDuration;
        valueAxis.rangeChangeDuration = stepDuration;
      }

      chart.invalidateRawData();

      categoryAxis.zoom({
        start: 0,
        end: itemsWithNonZero / categoryAxis.dataItems.length,
      });
    }

    categoryAxis.sortBySeries = series;

    let allData: stateDataDay = this.props.data

    chart.data = JSON.parse(JSON.stringify(allData[day.format('MM-DD-YYYY').toString()]));
    categoryAxis.zoom({ start: 0, end: 1 / chart.data.length });

    series.events.on("inited", function () {
      setTimeout(function () {
        playButton.isActive = true; // this starts interval
      }, 2000);
    });

    this.chart = chart
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    return <div id="chartdiv" style={{ width: "100%", height: "80vh" }}></div>;
  }
}

export default RaceChart;

