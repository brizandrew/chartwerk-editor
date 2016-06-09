import React from 'react';
import Select from 'react-select';
import _ from 'lodash';
import moment from 'moment';
import datetime from '../../constants/datetime';

export default React.createClass({

  propTypes: {
    actions: React.PropTypes.object,
    werk: React.PropTypes.object,
  },

  getInitialState() {
    const werk = this.props.werk;
    const base = werk.datamap.base;

    /**
     * Sniff data type of first data object's base property.
     * @return {String} The data type sniffed
     */
    function typeSniffer() {
      if (
        moment(
          werk.data[0][base],
          _.map(datetime, 'moment'), // An array of datetime formats
          true
        ).isValid()
      ) {
        return 'date';
      }
      if (
        typeof werk.data[0][base] === 'number'
      ) {
        return 'numerical';
      }

      return 'categorical';
    }

    return {
      type: werk.axes.base.type || typeSniffer.bind(this)(),
    };
  },

  componentDidMount() {
    this.props.actions.setBaseType(
      this.state.type
    );

    if (this.state.type === 'date') {
      this.setDateFormat();
    }
  },


  /**
   * Sniff for date format using moment.js.
   * @param  {Boolean} force  Whether to force dateSniffing. Used to avoid
   *                          	setState race conditions, e.g., setDateFormat.
   * @return {Integer} i      Index of object in datetime array.
   */
  dateSniffer(force = false) {
    if (this.state.type !== 'date' && !force) {
      return null;
    }

    const werk = this.props.werk;
    const base = werk.datamap.base;
    const momentFormats = _.map(datetime, 'moment');
    let valid = false;
    let i = 0;

    /**
     * Check that datetime format parses all row-wise data.
     * @param  {String} format  A moment.js datetime format.
     * @return {Integer}        If dateformat parses all data,
     *                             the index of the datetime
     *                             object.
     */
    function rowCheck(format) {
      let stillValid = true;
      let rowI = 0;
      while (stillValid && rowI < this.props.werk.data.length) {
        stillValid = moment(
          this.props.werk.data[rowI][base],
          format,
          true
        ).isValid();
        rowI++;
      }
      return stillValid;
    }

    while (!valid && i <= momentFormats.length) {
      valid = rowCheck.bind(this)(momentFormats[i]);
      i = valid ? i : i + 1;
    }

    return valid ? i : null;
  },

  /**
   * Pass d3-friendly date format string back to state tree.
   * @return {void}
   */
  setDateFormat() {
    const i = this.dateSniffer(true);
    this.props.actions.setDateFormat(
      _.map(datetime, 'd3')[i]
    );
  },

  changeType(e) {
    this.props.actions.setBaseType(e.value);
    this.setState({ type: e.value });
    if (e.value === 'date') {
      this.setDateFormat();
    } else {
      this.props.actions.unsetDateFormat();
    }
  },

  render() {
    const werk = this.props.werk;

    const typeOptions = [
      { value: 'categorical', label: 'Categorical' },
      { value: 'numerical', label: 'Numerical' },
      { value: 'date', label: 'Date' },
    ];

    let i = null; // Index for datetime array
    if (werk.axes.base.type === 'date') {
      i = this.dateSniffer();
    }

    /**
     * If dateSniffer returned a valid datetime format, ie, the index
     * of a datetime object, add humanized label. If it didn't but date
     * format was picked, add parse error. Otherwise, null.
     */
    let dateLabel = null;
    if (i !== null) {
      dateLabel = (
        <div className="dateformat">
          Format: {_.map(datetime, 'human')[i]}
        </div>
      );
    } else if (werk.axes.base.type === 'date') {
      dateLabel = (
        <div className="dateformat error">
          Date parse error!
        </div>
      );
    }

    return (
      <div className="base-type">
        <Select
          name="base"
          value={this.state.type}
          options={typeOptions}
          searchable={false}
          onChange={this.changeType}
          placeholder="What data type?"
          clearable={false}
        />
        {dateLabel}
      </div>
    );
  },

});
