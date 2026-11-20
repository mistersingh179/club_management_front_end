import {Alert, Button, Modal} from 'react-bootstrap'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const rowLabel = (row) =>
  `Line ${row.line}: ${row.name || '(no name)'}` +
  (row.usatt_number ? `, USATT ${row.usatt_number}` : ', no USATT number');

// A row with no usable USATT number gets matched by name again next upload.
const matchedByNameLabel = (row) =>
  row.usatt_number
    ? `${rowLabel(row)} (now saved)`
    : `Line ${row.line}: ${row.name || '(no name)'}, no USATT number in the file, so still matched by name`;

// For an unmatched row, the numbers the app has saved for that name show a
// stale or mistyped number at a glance.
const unmatchedLabel = (row) => {
  const saved = row.saved_usatt_numbers || [];
  return rowLabel(row) +
    (saved.length > 0 ? ` (the app has USATT ${saved.join(', ')} for this name)` : '');
};

// Shown after a ratings CSV upload: what was updated, and which rows need a
// fix before the next upload.
class RatingsImportSummaryModal extends Component {
  static propTypes = {
    summary: PropTypes.object,
    error: PropTypes.string,
    closeModal: PropTypes.func.isRequired
  };

  render() {
    const {summary, error, closeModal} = this.props;

    return (
      <Modal show={Boolean(summary || error)} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Ratings upload</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert bsStyle='danger'>{error}</Alert>}
          {summary && this._renderSummary(summary)}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  _renderSummary(summary) {
    const updated = summary.matched_by_usatt_number + summary.matched_by_name.length;

    return (
      <div>
        <p>
          Read {plural(summary.rows, 'row')}. Updated {plural(updated, 'player')}
          {summary.matched_by_name.length > 0 &&
            ` (${summary.matched_by_usatt_number} by USATT number)`}.
        </p>

        {summary.matched_by_name.length > 0 && (
          <div>
            <h5>Matched by name</h5>
            <p>
              These players had no USATT number in the app yet. Where the file had one, it is now saved,
              so next time they are matched by number.
            </p>
            <ul>{summary.matched_by_name.map(row => <li key={row.line}>{matchedByNameLabel(row)}</li>)}</ul>
          </div>
        )}

        {summary.unmatched.length > 0 && (
          <Alert bsStyle='warning'>
            <h5>{plural(summary.unmatched.length, 'row')} matched no member, so nothing was updated for them</h5>
            <p>
              Open the member in the app and enter their USATT Number (or correct the number in the file),
              then upload again.
            </p>
            <ul>{summary.unmatched.map(row => <li key={row.line}>{unmatchedLabel(row)}</li>)}</ul>
          </Alert>
        )}

        {summary.problems.length > 0 && (
          <Alert bsStyle='warning'>
            <h5>{plural(summary.problems.length, 'value')} could not be read</h5>
            <ul>
              {summary.problems.map((problem, i) =>
                <li key={i}>Line {problem.line} ({problem.name || 'no name'}): {problem.message}</li>
              )}
            </ul>
          </Alert>
        )}
      </div>
    );
  };
}

export default RatingsImportSummaryModal
