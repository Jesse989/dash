import React, { Component } from "react";
import SampleChart from "./SampleChart";
import DataAPI from "./DataAPI";
import { Spinner } from "react-bootstrap";
import RaceChart from './RaceChart'

interface MyState {
    loading: boolean,
    data: []
}
class DataParent extends Component <{}, MyState> {
    state: MyState = {
        loading: true,
        data: []
    }

  componentWillMount() {
    let url =
      "https://raw.githubusercontent.com/midas-network/COVID-19/master/data/cases/united%20states%20of%20america/nytimes_covid19_data/20200406_us-counties.csv";
    let api = new DataAPI(url);
    api.getData((res: { data: any; }) => {
        this.setState({ loading: false, data: res.data })
    })
    
  }

  render() {
    const { loading, data } = this.state
    if (loading) {
      return <Spinner animation="border" />;
    } else {
      return <RaceChart data={data} />;
    }
  }
}

export default DataParent;
