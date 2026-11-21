import {Alert, Button, Modal, Table} from 'react-bootstrap'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const rowLabel = (row) =>
  `Line ${row.line}: ${row.name || '(no name)'}` +
  (row.usatt_number ? `, USATT ${row.usatt_number}` : ', no USATT number');

// For an unmatched row, the numbers the app has saved for that name show a
// stale or mistyped number at a glance.
const unmatchedLabel = (row) => {
  const saved = row.saved_usatt_numbers || [];
  return rowLabel(row) +
    (saved.length > 0 ? ` (the app has USATT ${saved.join(', ')} for this name)` : '');
};

// Dates arrive as YYYY-MM-DD; the members table shows MM-DD-YYYY.
const formatValue = (field, value) => {
  if (value === null || value === undefined || value === '') return 'none';
  if (field === 'usatt_expiration') {
    const [year, month, day] = String(value).split('-');
    return day ? `${month}-${day}-${year}` : String(value);
  }
  return String(value);
};

// The body is the popup's only scroll area, so a long upload (150+ players)
// keeps the buttons on screen. It has no top padding, so the column titles
// stick flush to its top edge while the list scrolls under them.
const bodyStyle = { maxHeight: 'calc(100vh - 210px)', overflowY: 'auto', paddingTop: 0 };
const stickyHeader = {
  position: 'sticky', top: 0, zIndex: 1, background: '#fff', boxShadow: 'inset 0 -2px 0 #ddd'
};

// A changed value shows old → new; an unchanged one shows what is saved, in grey.
// A value never breaks inside itself (dates have hyphens); on a phone the cell
// wraps at the arrow instead.
const noWrap = { whiteSpace: 'nowrap' };
const ChangeCell = ({ field, change, current }) => {
  if (!change) {
    return <td className='text-muted' style={noWrap}>{current === undefined ? '–' : formatValue(field, current)}</td>;
  }
  return (
    <td>
      <span className='text-muted' style={noWrap}>{formatValue(field, change[0])} →</span>
      {' '}
      <strong style={noWrap}>{formatValue(field, change[1])}</strong>
    </td>
  );
};

const nameMatchNote = (change, reviewing) => {
  if (!change.fields.usatt_number) return 'matched by name (no USATT number in the file)';
  return reviewing ? 'matched by name; the USATT number will be saved' : 'matched by name; USATT number saved';
};

// After a ratings CSV is chosen: first a review of what the file changes
// (nothing saved yet, summary.saved is false), then, once saved, the same
// list as a record of what was saved. Rows that need a fix before the next
// upload are listed either way.
class RatingsImportSummaryModal extends Component {
  static propTypes = {
    summary: PropTypes.object,
    error: PropTypes.string,
    applying: PropTypes.bool,
    onApply: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired
  };

  // The list may be scrolled far down when Save is clicked; bring a new error
  // or the saved result into view instead of leaving it above the fold.
  componentDidUpdate(prevProps) {
    const {summary, error} = this.props;
    const body = this.content && this.content.parentNode;
    if (body && ((error && error !== prevProps.error) || (summary && summary !== prevProps.summary))) {
      body.scrollTop = 0;
    }
  };

  render() {
    const {summary, error, applying, onApply, closeModal} = this.props;
    const reviewing = Boolean(summary && summary.saved === false);
    const changes = (summary && summary.changes) || [];

    return (
      <Modal show={Boolean(summary || error)} onHide={applying ? () => {} : closeModal} bsSize='large'>
        <Modal.Header closeButton={!applying}>
          <Modal.Title>{reviewing ? 'Review ratings upload' : 'Ratings upload'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={bodyStyle}>
          <div style={{ paddingTop: 15 }} ref={(content) => (this.content = content)}>
            {error && <Alert bsStyle='danger'>{error}</Alert>}
            {summary && this._renderSummary(summary, reviewing, changes)}
          </div>
        </Modal.Body>
        <Modal.Footer>
          {reviewing && changes.length > 0 ? (
            <div>
              <Button onClick={closeModal} disabled={applying}>Cancel</Button>
              <Button bsStyle='primary' onClick={onApply} disabled={applying}>
                {applying ? 'Saving…' : `Save changes for ${plural(changes.length, 'player')}`}
              </Button>
            </div>
          ) : (
            <Button onClick={closeModal}>Close</Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  };

  _renderSummary(summary, reviewing, changes) {
    return (
      <div>
        <p>{this._headline(summary, reviewing, changes)}</p>
        {reviewing && changes.length > 0 &&
          <p className='text-muted'>Nothing is saved until you click Save changes.</p>}
        {summary.repeated && summary.repeated.length > 0 && this._renderRepeated(summary.repeated)}

        {summary.unmatched.length > 0 && (
          <Alert bsStyle='warning'>
            <h5>
              {plural(summary.unmatched.length, 'row')} matched no member, so nothing
              {reviewing ? ' will be' : ' was'} updated for them
            </h5>
            <p>
              Open the member in the app and enter their USATT Number (or correct the number in the file),
              then upload again.
            </p>
            <ul>{summary.unmatched.map(row => <li key={row.line}>{unmatchedLabel(row)}</li>)}</ul>
          </Alert>
        )}

        {summary.problems.length > 0 && (
          <Alert bsStyle='warning'>
            <h5>{plural(summary.problems.length, 'value')} could not be read, so {reviewing ? 'they will be' : 'they were'} skipped</h5>
            <ul>
              {summary.problems.map((problem, i) =>
                <li key={i}>Line {problem.line} ({problem.name || 'no name'}): {problem.message}</li>
              )}
            </ul>
          </Alert>
        )}

        {changes.length > 0 && this._renderChanges(changes, reviewing)}
      </div>
    );
  };

  _headline(summary, reviewing, changes) {
    const read = `Read ${plural(summary.rows, 'row')}.`;
    // A backend from before the change list only reports matches.
    if (!summary.changes) {
      const matched = summary.matched_by_usatt_number + summary.matched_by_name.length;
      return `${read} Updated ${plural(matched, 'player')}.`;
    }
    const upToDate = summary.unchanged > 0 ? ` ${summary.unchanged} already up to date.` : '';
    if (changes.length === 0) {
      if (summary.unchanged === 0) return `${read} Nothing to change.`;
      return reviewing
        ? `${read} Nothing to change: ${plural(summary.unchanged, 'matched player')} already up to date.`
        : `${read} Everything is up to date (${plural(summary.unchanged, 'matched player')}).`;
    }
    return reviewing
      ? `${read} ${plural(changes.length, 'player')} will change.${upToDate}`
      : `${read} Saved changes for ${plural(changes.length, 'player')}.${upToDate}`;
  };

  // Two exports combined by hand can list a player twice; say which rows.
  _renderRepeated(repeated) {
    const shown = repeated.slice(0, 10).map(row => row.line).join(', ');
    const more = repeated.length > 10 ? ` and ${repeated.length - 10} more` : '';
    return (
      <p className='text-muted small'>
        {plural(repeated.length, 'row')} {repeated.length === 1 ? 'repeats' : 'repeat'} a player listed earlier
        in the file: line{repeated.length === 1 ? '' : 's'} {shown}{more}. Where both rows have a value, the later one is used.
      </p>
    );
  };

  _renderChanges(changes, reviewing) {
    const anyByName = changes.some(change => change.matched_by === 'name');

    return (
      <div>
        <Table condensed striped style={{ marginBottom: 0 }}>
          <thead>
            <tr>
              <th style={stickyHeader}>Player</th>
              <th style={stickyHeader}>USATT #</th>
              <th style={stickyHeader}>Rating</th>
              <th style={stickyHeader}>USATT exp</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((change, i) => {
              const current = change.current || {};
              return (
                <tr key={`${change.member_id}-${i}`}>
                  <td>
                    {change.name}
                    {change.matched_by === 'name' &&
                      <div className='text-muted small'>{nameMatchNote(change, reviewing)}</div>}
                  </td>
                  <ChangeCell field='usatt_number' change={change.fields.usatt_number}
                              current={change.usatt_number} />
                  <ChangeCell field='league_rating' change={change.fields.league_rating}
                              current={current.league_rating} />
                  <ChangeCell field='usatt_expiration' change={change.fields.usatt_expiration}
                              current={current.usatt_expiration} />
                </tr>
              );
            })}
          </tbody>
        </Table>
        {anyByName && (
          <p className='text-muted small' style={{ marginTop: 10 }}>
            Matched by name: the player had no USATT number in the app, so the row was matched by their name.
            Where the file has a number, it {reviewing ? 'will be' : 'is'} saved, so next time they are matched by number.
          </p>
        )}
      </div>
    );
  };
}

export default RatingsImportSummaryModal
