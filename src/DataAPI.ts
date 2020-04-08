// fetch data
import Papa, { ParseResult } from "papaparse";
import axios from "axios";
import { checkBoolean } from "@amcharts/amcharts4/core";
import moment from "moment";

export default class DataAPI {
  urls: Array<string>;
  rawCSV: Array<string>;
  parsedCSV: Array<any>;
  formattedCsv: stateDataDay;
  states: Array<string>;

  constructor(urls: Array<string>) {
    this.urls = urls;
    this.rawCSV = [];
    this.parsedCSV = [];
    this.formattedCsv = { "01-22-2020": [] };
    this.states = [
      "USA (Aggregate Recovered)",
      "New York",
      "New Jersey",
      "Michigan",
      "California",
      "Louisiana",
      "Massachusetts",
      "Florida",
      "Pennsylvania",
      "Illinois",
      "Washington",
      "Texas",
      "Georgia",
      "Connecticut",
      "Colorado",
      "Indiana",
      "Ohio",
      "Maryland",
      "Tennessee",
      "North Carolina",
      "Virginia",
      "Missouri",
      "Wisconsin",
      "Arizona",
      "South Carolina",
      "Alabama",
      "Nevada",
      "Mississippi",
      "Utah",
      "Oklahoma",
      "Idaho",
      "Oregon",
      "District of Columbia",
      "Rhode Island",
      "Kentucky",
      "Minnesota",
      "Iowa",
      "Arkansas",
      "Kansas",
      "Delaware",
      "New Hampshire",
      "New Mexico",
      "Vermont",
      "Puerto Rico",
      "Maine",
      "Nebraska",
      "Hawaii",
      "Navajo Nation",
      "West Virginia",
      "Montana",
      "South Dakota",
      "North Dakota",
      "Wyoming",
      "Alaska",
      "Guam",
      "Grand Princess",
      "Diamond Princess",
      "United States Virgin Islands",
      "Northern Mariana Islands",
      "Wuhan Evacuee",
    ];
  }

  fetchCsvFiles(onComplete: (arg0: any) => void) {
    for (let index in this.urls) {
      axios
        .get(this.urls[index])
        .then((res) => {
          this.rawCSV.push(res.data);
          onComplete(this.rawCSV);
        })
        .catch((err) => {
          this.rawCSV.push("error");
          onComplete("error");
          console.log(err);
        });
    }
  }

  parseCsv(onComplete: (arg0: any) => void) {
    // parse csv into objects:
    for (let index in this.rawCSV) {
      Papa.parse(this.rawCSV[index], {
        header: true,
        complete: (data) => {
          this.parsedCSV.push(data.data);
          onComplete(this.parsedCSV);
        },
      });
    }
  }

  formatCsv(dates: string[], onComplete: (arg0: any) => void) {
    // start with full list of states, initialized to zero
    //
    //      assign matching dates to object[date].push(),
    //      while also keeping only the two values we need:
    //      state and cases
    //
    
    for (let state of this.states) {
      for (let date of dates) {
        let result: stateDataPoint = { state: state, cases: 0 };
        if (
          this.formattedCsv[date] &&
          this.formattedCsv[date].filter((e) => e.state == state).length == 0
        ) {
          this.formattedCsv[date].push(result);
        } else {
          this.formattedCsv[date] = [result];
        }
      }
    }

    
    // now do the rest of the days:
    for (let chunk of this.parsedCSV) {
      for (let row of chunk) {
        const date = moment(row["Last Update"]).format("MM-DD-YYYY");
        const state = row.name;
        const cases = row.Confirmed;
        if (this.formattedCsv[date]) {
          this.formattedCsv[date].filter((e) => e.state == state).map((e) => e.cases = cases);
  
        }
      }
    }

    // now interpolate values
    for (let date of dates) {
        let todayDate = moment(date).format('MM-DD-YYYY')
        let tomorrowDate = moment(date).add(1, 'days').format('MM-DD-YYYY')
        for (let row of this.formattedCsv[todayDate]) {
            let state = row.state
            if (this.formattedCsv[tomorrowDate] && this.formattedCsv[tomorrowDate].length > 0) {
                let tomorrowRow = this.formattedCsv[tomorrowDate].filter((e) => e.state == state)[0]
                if (tomorrowRow && row.cases > tomorrowRow.cases) {
                    this.formattedCsv[tomorrowDate].filter((e) => e.state == state).map((e) => e.cases = row.cases)
                }
            }

        }
    }

    onComplete(this.formattedCsv);
  }
}

interface stateDataDay {
  [prop: string]: Array<stateDataPoint>;
}

interface stateDataPoint {
  state: string;
  cases: number;
}
