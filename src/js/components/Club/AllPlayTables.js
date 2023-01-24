import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Form, Button, FormGroup, ControlLabel, Panel, MenuItem, DropdownButton } from "react-bootstrap";
import {Link} from 'react-router-dom'
import Capitalize from 'capitalize'
import SinglePlayTable from "./SinglePlayTable";
import UnassignedMembers from "./UnassignedMembers";
import PlayScore from "./PlayScore";
import GroupOfThree from "../PlayOrder/GroupOfThree";
import GroupOfFour from "../PlayOrder/GroupOfFour";
import GroupOfFive from "../PlayOrder/GroupOfFive";
import GroupOfSix from "../PlayOrder/GroupOfSix";
import GroupOfSevenAndEight from "../PlayOrder/GroupOfSevenAndEight";
import _ from "lodash"
import { toast } from 'react-toastify';

class AllPlayTables extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberOfTables: 6,
      peoplePerTable: 5,
      columns: 3,
      displayPlayOrder: true,
      displayScoreTables: false,
      displayPlayerNamesInScoreTables: false
    }
  };

  static defaultProps = {
    members: []
  };

  static propTypes = {
    members: PropTypes.array.isRequired,
    assignTablesStraightForClub: PropTypes.func.isRequired,
    assignTablesEveryOtherForClub: PropTypes.func.isRequired,
    assignTablesRandomForClub: PropTypes.func.isRequired,
    updateMember: PropTypes.func.isRequired,
  };

  render() {
    const {members, updateMember} = this.props;
    const {numberOfTables, peoplePerTable, displayScoreTables,
      columns, displayPlayOrder, displayPlayerNamesInScoreTables} = this.state;

    return (
      <div>
        <Panel header="Table Assignment Options" bsStyle="primary" className={'no-print'}>
          <Form onSubmit={e => e.preventDefault()}>
            <FormGroup controlId='nameBox'>
              <ControlLabel>Number of Tables</ControlLabel>{'  '}
              <select value={numberOfTables} onChange={this._numberOfTablesChanged}
                      ref={c => this._numberOfTablesInput= c}
                      className={`form-control`}
              >
                {_.times(20, (n) => <option value={n+1}>{n+1}</option>)}
              </select>
            </FormGroup>{'  '}
            <FormGroup controlId='emailBox'>
              <ControlLabel>Number of People Per Table</ControlLabel>{'  '}
              <select value={peoplePerTable} onChange={this._peoplePerTableChanged}
                      ref={c => this._peoplePerTableInput= c}
                      className={`form-control`}
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="7">8</option>
              </select>
            </FormGroup>
            <DropdownButton bsStyle={`default`} title={'Table Assignment Options'} id={`dropdown-basic`}>
              <MenuItem onSelect={this._assignTablesEveryOtherForClub}>
                Every Other
              </MenuItem>
              <MenuItem onSelect={this._assignTablesStraightForClub}>
                Straight
              </MenuItem>
              <MenuItem onSelect={this._assignTablesRandomForClub}>
                Random
              </MenuItem>
            </DropdownButton>
          </Form>
        </Panel>
        <Panel header="Print Options" bsStyle="primary" className={'no-print'}>
          <Form className={'no-print'} onSubmit={e => e.preventDefault()}>
            <FormGroup controlId='columnsBox'>
              <ControlLabel>Play Order</ControlLabel>{'  '}
              <select value={displayPlayOrder} onChange={this._displayPlayOrderChanged}
                      ref={c => this._displayPlayOrderInput= c}
                      className={`form-control`}
              >
                <option value="true">yes</option>
                <option value="false">no</option>
              </select>
            </FormGroup>
            <FormGroup controlId='columnsBox'>
              <ControlLabel>Score Tables</ControlLabel>{'  '}
              <select value={displayScoreTables} onChange={this._displayScoreTablesChanged}
                      ref={c => this._displayScoreTablesInput= c}
                      className={`form-control`}
              >
                <option value="true">yes</option>
                <option value="false">no</option>
              </select>
            </FormGroup>
            <FormGroup controlId='columnsBox'>
              <ControlLabel>Number of Score Tables Per Row</ControlLabel>{'  '}
              <select value={columns} onChange={this._columnsChanged}
                      ref={c => this._columnsInput= c}
                      className={`form-control`}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="6">6</option>
              </select>
            </FormGroup>
            <FormGroup controlId='columnsBox'>
              <ControlLabel>Names in Score Tables</ControlLabel>{'  '}
              <select value={displayPlayerNamesInScoreTables} onChange={this._displayPlayerNamesInScoreTablesChanged}
                      ref={c => this.displayPlayerNamesInScoreTables= c}
                      className={`form-control`}
              >
                <option value="true">yes</option>
                <option value="false">no</option>
              </select>
            </FormGroup>
            <Button bsStyle="success" onClick={window.print} >
              Print
            </Button>
          </Form>
        </Panel>
        <UnassignedMembers members={members} updateMember={updateMember} numberOfTables={numberOfTables}/>
        {[...Array(numberOfTables)].map( (currVal, idx, arr) => {
          return (
            <div key={idx} className={idx+1 < numberOfTables ? 'page-break-after' : 'page-break-none'}>
              <SinglePlayTable members={members} tableNumber={idx+1}
                               updateMember={updateMember} numberOfTables={numberOfTables} />
              {this._playOrder(idx+1)}
              {displayScoreTables ? <PlayScore members={members} tableNumber={idx+1}
                         columns={columns}
                         displayPlayerNamesInScoreTables={displayPlayerNamesInScoreTables} /> : '' }
            </div>
          );
        })}

      </div>
    );
  };

  _playOrder = (tableNumber) => {
    
    const {members} = this.props;
    const {displayPlayOrder} = this.state;
    
    let myMembers = members.filter(m => m.table_number === tableNumber).sort((a,b) => b.league_rating - a.league_rating);
    let num = myMembers.length;
    
    if(displayPlayOrder == false){
      return '';
    }
    
    switch(num){
      case 3:
        return <GroupOfThree />;
      case 4:
        return <GroupOfFour />;
      case 5:
        return <GroupOfFive />;
      case 6:
        return <GroupOfSix />;
      case 7:
        return <GroupOfSevenAndEight />;
      case 8:
        return <GroupOfSevenAndEight />;
      default:
        return '';
    }
  }
  
  _peoplePerTableChanged = (e) => {
    this.setState({
      peoplePerTable: parseInt(e.target.value) || 0
    })
  };

  _displayPlayOrderChanged = (e) => {
    this.setState({
      displayPlayOrder: e.target.value.toLowerCase() == 'true' ? true : false
    })
  };

  _displayPlayerNamesInScoreTablesChanged = (e) => {
    this.setState({
      displayPlayerNamesInScoreTables: e.target.value.toLowerCase() == 'true' ? true : false
    })
  };
  
  _displayScoreTablesChanged = (e) => {
    this.setState({
      displayScoreTables: e.target.value.toLowerCase() == 'true' ? true : false
    })
  };

  _numberOfTablesChanged = (e) => {
    this.setState({
      numberOfTables: parseInt(e.target.value) || 0
    })
  };

  _columnsChanged = (e) => {
    this.setState({
      columns: parseInt(e.target.value) || 0
    })
  };

  _assignTablesStraightForClub = (e) => {
    const {assignTablesStraightForClub} = this.props;
    const {numberOfTables, peoplePerTable} = this.state;
    assignTablesStraightForClub(numberOfTables, peoplePerTable);
  };

  _assignTablesEveryOtherForClub = (e) => {
    const {assignTablesEveryOtherForClub} = this.props;
    const {numberOfTables, peoplePerTable} = this.state;
    assignTablesEveryOtherForClub(numberOfTables, peoplePerTable);
  }

  _assignTablesRandomForClub = (e) => {
    const {assignTablesRandomForClub} = this.props;
    const {numberOfTables, peoplePerTable} = this.state;
    assignTablesRandomForClub(numberOfTables, peoplePerTable);
  }

};

export default AllPlayTables