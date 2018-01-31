import React, { Component } from 'react';
import style from 'material-ui/svg-icons/image/style';
import CopyToClipboard from 'react-copy-to-clipboard';
import { getEthTransactionHistory, getSentTransactionHistory } from '../Actions/AccountActions';
import { setTimeout } from 'timers';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import _ from 'lodash';
import { RaisedButton, IconButton, Snackbar } from 'material-ui';
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import EtherTransaction from './EtherTransaction';
import SentTransaction from './SentTransaction';
let zfill = require('zfill');

let shell = window
  .require('electron')
  .shell;

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ethData: [],
      sentData: [],
      isGetHistoryCalled: false,
      isLoading: true,
      ethActive: true,
      pageNumber: 1,
      nextDisabled: false,
      isInitial: true
    }
  }

  renderProgress() {
    const { refresh } = styles;
    return (
      <RefreshIndicator
        size={50}
        left={350}
        top={150}
        loadingolor="#532d91"
        status="loading"
        style={refresh}
      />
    )
  }

  getEthHistory(page) {
    this.setState({ isLoading: true });
    let that = this;
    getEthTransactionHistory(this.props.local_address, page, (err, history) => {
      if (err) {
        that.setState({ isLoading: false, nextDisabled: true })
      }
      else {
        that.setState({ ethData: _.sortBy(history, o => o.timeStamp).reverse(), pageNumber: page, isLoading: false })
      }
    })
  }

  getSentHistory() {
    this.setState({ isLoading: true });
    let that = this;
    getSentTransactionHistory('0x' + zfill(this.props.local_address.substring(2), 64), (err, history) => {
      if (err) {
        that.setState({ isLoading: false })
      }
      else {
        that.setState({ sentData: _.sortBy(history, o => o.timeStamp).reverse(), isLoading: false })
      }
    })
  }

  handleRefresh() {
    if (this.state.ethActive)
      this.getEthHistory(1);
    else
      this.getSentHistory();
  }

  render() {
    if (this.state.isInitial && this.props.local_address !== "") {
      this.getEthHistory(this.state.pageNumber);
      this.getSentHistory();
      this.setState({ isInitial: false });
    }
    let ethOutput = <EtherTransaction data={this.state.ethData} local_address={this.props.local_address} />
    let sentOutput = <SentTransaction data={this.state.sentData} local_address={this.props.local_address} />
    return (
      <div style={{ margin: '1% 3%' }}>
        {this.state.ethActive ?
          <span style={styles.transactionsHeading}>Eth Transactions</span> :
          <span style={styles.transactionsHeading}>Sent Transactions</span>}
        <span style={{ marginLeft: '60%' }}>
          <IconButton>
            <Refresh onClick={this.handleRefresh.bind(this)} />
          </IconButton>
          <RaisedButton
            label="ETH"
            buttonStyle={this.state.ethActive ? { backgroundColor: 'grey' } : {}}
            onClick={() => { this.setState({ ethActive: true }) }}
          />
          <RaisedButton
            label="SENT"
            buttonStyle={this.state.ethActive ? {} : { backgroundColor: 'grey' }}
            onClick={() => { this.setState({ ethActive: false }) }}
          />
        </span>
        {this.state.isLoading === true ? this.renderProgress() :
          <div >
            {this.state.ethActive ?
              <div>
                {ethOutput}
                <div style={{ float: 'right' }}>
                  <RaisedButton
                    label="Back"
                    onClick={() => { this.getEthHistory(this.state.pageNumber - 1) }}
                    disabled={this.state.pageNumber == 1 ? true : false}
                  />
                  <RaisedButton
                    label="Next"
                    disabled={this.state.nextDisabled}
                    onClick={() => { this.getEthHistory(this.state.pageNumber + 1) }}
                  />
                </div>
              </div>
              :
              <div>
                {sentOutput}
              </div>}
          </div>
        }
      </div>
    )
  }
}

const styles = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  transactionsHeading: {
    fontSize: 16,
    fontWeight: 600
  }
}

export default History;