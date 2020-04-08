import React, { Component } from "react";
import DataAPI from "./DataAPI";
import { Spinner } from "react-bootstrap";
import RaceChart, { stateDataDay } from "./RaceChart";
import moment, { Moment } from "moment";

interface MyState {
  loading: boolean;
  data: stateDataDay;
}
class DataParent extends Component<{}, MyState> {
  state: MyState = {
    loading: true,
    data: {},
  };

  componentDidMount() {
    const startDate = moment("01-22-2020", "MM-DD-YYYY");
    const endDate = moment("04-06-2020", "MM-DD-YYYY");
    const dates = getDates(startDate, endDate);
    let urls = [];
    for (let date of dates) {
      urls.push(
        `https://raw.githubusercontent.com/GitHub-ccd/COVID19-USA-Flatiron/master/Data/nssac-ncov-data-country-state/nssac-ncov-sd-${date}.csv`
      );
    }

    const api = new DataAPI(urls);

    api.fetchCsvFiles((csvs) => {
      // console.log(`fetched CSV's: ${csvs.length}/${urls.length}`)
      const complete = csvs.length === urls.length;
      if (complete) {
        api.parseCsv((data) => {
          // console.log(`parsed CSV's: ${data.length}/${urls.length}`)
          const complete = data.length === urls.length;
          if (complete) {
            api.formatCsv(dates, (formattedData) => {
              this.setState({ loading: false, data: formattedData });
              console.log(formattedData);
            });
          }
        });
      }
    });
  }

  render() {
    const { loading, data } = this.state;
    if (loading) {
      return (
        <Spinner id="spinner" animation="grow" variant="primary" />
      )
    } else {
      return <RaceChart data={data} />;
    }
  }
}

export default DataParent;

function getDates(startDate: Moment, stopDate: Moment) {
  // helper function to get array of dates between two dates
  var dateArray = [];
  var currentDate = moment(startDate);
  while (currentDate <= stopDate) {
    dateArray.push(moment(currentDate).format("MM-DD-YYYY"));
    currentDate = moment(currentDate).add(1, "days");
  }
  return dateArray;
}
