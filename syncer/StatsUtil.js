'use strict';
var util =  {

    // Constants
    //----------

    // Symbols used in the application
    SYMBOL_HERTZ: 'Hz',

    // Template for the unit with style
    TEMPLATE_UNIT: _.template(
      '<%=value%><span class="n-stats-unit"><%=unit%></span>'),

    // Units of measurement for decimal (used in storage format)
    UOM_B : 'byte(s)',
    UOM_KB: 'KB',
    UOM_MB: 'MB',
    UOM_GB: 'GB',
    UOM_TB: 'TB',
    UOM_PB: 'PB',

    // Units of measurement for binary (used in memory)
    UOM_KIB: 'KiB',
    UOM_MIB: 'MiB',
    UOM_GIB: 'GiB',
    UOM_TIB: 'TiB',
    UOM_PIB: 'PiB',

    // Common units of measurement
    UOM_PPM:  "PPM",
    UOM_PCT:  "PCT",
    UOM_OPS:  "OPS",
    UOM_MS:   "MS",
    UOM_RAW:  "RAW",

    // Minimum storage limit (1 MB)
    // 10^6 for storage instead of base 2^10. Memory is base 2^20.
    MINIMUM_STORAGE_LIMIT: 1000000,

    // Conversion from bytes for decimal (used in storage Format)
    STORAGE_UOM: {
      KB: 1000,
      MB: 1000000,
      GB: 1000000000,
      TB: 1000000000000
    },

    // ENG-20925 Conversion from bytes for binary (used in storage Format)
    STORAGE_BINARY_UOM: {
      KiB: 1024,
      MiB: 1048576,
      GiB: 1073741824,
      TiB: 1099511627776
    },



    // Functions (Stats Formatter)
    //----------------------------

    // Parses the stats data value based on passed metric type parameter
    // @param metric     - Metric type value from AppConstants.METRIC_*  OR
    //                     Property from DataProperties.STATS_*.
    // @param value      - Stats value to be converted to readable format.
    // @param hasUnit    - Set to false if the UOM label isn't included and
    //                     return numeric value. Default is true.
    statsFormat: function(metric, value, hasUnit) {
      // Set the default
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;

      // Parse the value as numeric
      value = parseFloat(value);

      // Check if stats is valid
      if (!this.isValidStats(value)) {
        return AppConstants.STATS_NOT_AVAILABLE;
      }

      // Check the metric type
      if (this.isStorageStats(metric)) {
        // Storage usage (decimal)
        return this.storageFormat(value, hasUnit);
      }
      else if (this.isBandwidthStats(metric)) {
        // Bandwidth
        return this.bandwidthFormat(value, hasUnit);
      }
      else if (this.isLatencyStats(metric)) {
        // Latency
        return this.latencyFormat(value, hasUnit);
      }
      else if (this.isIOPSStats(metric)) {
        // IOPS
        return this.iopsFormat(value, hasUnit);
      }
      else if (this.isMemoryUsageStats(metric)) {
        // Memory Usage
        return this.memoryUsageFormat(value, hasUnit);
      }
      else if (this.isCPUUsageStats(metric)) {
        // CPU Usage
        return this.cpuUsageFormat(value, hasUnit);
      }
      else if (this.isPPMStats(metric)) {
        // PPM
        return this.ppmFormat(value, hasUnit);
      }
      else if (this.isHundredsStats(metric)) {
        // PPH
        return this.hundredsFormat(value, hasUnit);
      }
      else if (this.isHzStats(metric)) {
        // Hz
        return this.cpuHertzFormat(value, hasUnit);
      }
      else if (this.isRawNumericStats(metric)) {
        return this.rawNumericFormat(value);
      } else {
        // If not known, attempt to guess based on metric name
        return this.formatByMetricName(metric, value, hasUnit);
      }
    },

    // Trim digits if necessary
    // The behavior here is to round or floor the digits of a float number
    // only up to the point of being an integer
    // @param value      - Value to be trimmed.
    // @param maxDigits  - Maximum number of digits for return value.  NOTE:
    //                     This value only determines if digits will be
    //                     rounded/floored from the right side of the
    //                     decimal.
    //                     e.g. if maxDigits = 3, the value 3045.7 would
    //                     become 3046 or 3045
    // @param floor      - Boolean, determines if value is roudned or floored
    formatDecimalDigits: function(value, maxDigits, floor){
      if (!maxDigits || maxDigits <= 0) {
        return value;
      }

      var num = parseFloat(value);

      if (isNaN(num)) {
        return value;
      }

      var decimalLocation = num.toString().search(/\./);

      // Only trim digits if a float number
      // decimalLocation will be -1 if no decimal
      if (decimalLocation > -1) {
        var digitCount = num.toString().length - 1;

        if (digitCount > maxDigits) {
          var stringValue = (typeof(value) === 'string') ? value :
            AppUtil.safeStringify(value);

          var trimmableDigits = digitCount - decimalLocation;
          var newDigitQty = trimmableDigits - (digitCount - maxDigits);
          newDigitQty = (newDigitQty > -1 ? newDigitQty : 0);

          if (floor) {
            value = this.floor(num,newDigitQty);
          }
          else {
            value = this.round(num,newDigitQty);
          }

          // Append units if value has units
          if (stringValue.search(' ') >= 0) {
            var val = stringValue.split(' ');
            value = (val.length > 1 ? value + ' ' + val[1] : value);
          }
        }
      }

      return value;
    },

    // Given a metric, get its units of measurement
    getMetricUnits: function(metric) {

      if ( this.isIOPSStats(metric) ) {
        return this.UOM_OPS;
      }

      if ( this.isPPMStats(metric) ) {
        return this.UOM_PPM;
      }

      if ( this.isBandwidthStats(metric) ) {
        return this.UOM_KB;
      }

      if ( this.isLatencyStats(metric) ) {
        return this.UOM_MS;
      }

      if ( this.isCPUUsageStats(metric) ||
           this.isMemoryUsageStats(metric) ) {
        return this.UOM_PCT;
      }

      if ( this.isStorageStats(metric) ) {
        return this.UOM_B;
      }

      return null;

    },


    // Functions (Storage Formatter)
    //------------------------------

    // Converts bytes to readable storage unit of measurement in decimal.
    // @param value      - the bytes that will be converted
    // @param hasUnit    - Set to false if the UOM label isn't included and
    //                     return numeric value. Default is true.
    // @param defautUnit - The default unit displayed
    // Example: Converts 1024 to 1KB
    storageFormat: function(value, hasUnit, defaultUnit) {
      if (value >= 0) {
        return this._convertRawBytesToUOM(false, value, hasUnit,defaultUnit);
      }
      else if (isNaN(value)) {
        return AppConstants.STATS_NOT_AVAILABLE;
      }
      else {
        return CommonTemplates.STATS_NOT_COMPATIBLE;
      }
    },

    // Converts bytes to readable storage unit of measurement in binary.
    // @param value      - the bytes that will be converted
    // @param hasUnit    - Set to false if the UOM label isn't included and
    //                     return numeric value. Default is true.
    // @param defaultUnit - The default unit displayed
    // Example: Converts 1024 to 1KB
    // NOTE: ENG-20925 we move the storage format from base 10 to base 2
    // Commenting out the storageBinaryFormat as storageFormat will be doing
    // the unit conversion to base 2.
    // storageBinaryFormat: function(value, hasUnit, defaultUnit) {
    // return this._convertRawBytesToUOM(false, value, hasUnit, defaultUnit);
    //},

    // Converts bytes to a readable unit of measurement of either decimal
    // (GB) or binary (GiB).
    // @param isDecimal  - If true use decimal (GB), otherwise binary (GiB)
    // @param value      - the bytes that will be converted
    // @param hasUnit    - Set to false if the UOM label isn't included and
    //                     return numeric value. Default is true.
    // @param defautUnit - The default unit displayed
    // Example: Converts 1000 to 1KB
    _convertRawBytesToUOM: function(isDecimal, value, hasUnit, defaultUnit) {
      var divider = isDecimal ? 1000 : 1024;

      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;

      // Default is GB/GiB if value is 0 and the defaultUnit is not provided
      defaultUnit = (typeof defaultUnit === 'undefined') ?
          (isDecimal ? this.UOM_GB : this.UOM_GIB) : defaultUnit;

      // Create the units array
      var units;
      if (isDecimal) {
        units = [ this.UOM_B, this.UOM_KB, this.UOM_MB, this.UOM_GB,
                  this.UOM_TB, this.UOM_PB ];
      } else {
        units = [ this.UOM_B, this.UOM_KIB, this.UOM_MIB, this.UOM_GIB,
                  this.UOM_TIB, this.UOM_PIB ];
      }

      value = Number(value);
      if (isNaN(value) || value === 0 || value === null) {
        return 0 + (hasUnit === true ? ' ' + defaultUnit : 0);
      }

      // If the number reaches 4 digits, for binary prefix
      // (order of 1024) we will round it off [1000/1024 = 0.9765].
      var quotient = isDecimal ? 1 : 0.9765;
      for (var i = units.length-1; i >= 0; i--) {
        if ((value / Math.pow(divider, i)) >= quotient || i === 0) {
          // Search for the correct unit then round off
          return Math.round((value / Math.pow(divider, i)) * 100) / 100 +
                  (hasUnit === true ? ' '+ units[i] : 0);
        }
      }
    },

    // Returns the usageStats value based on the dataPropKey. The backend
    // will always give 0 value for usage stats if it's not available. This
    // also converts the value to Number since the backend gives us a string.
    // @param model -  entity model that has usageStats object
    // @param dataPropKey - key from DataProperties storage
    getUsageStats: function(model, dataPropKey) {
      var usageStats;

      // Check if model
      if (_.isFunction(model.get)) {
        usageStats = model.get(DataProp.USAGE_STATS);
      }
      // Check if object
      else if (model[DataProp.USAGE_STATS]) {
        usageStats = model[DataProp.USAGE_STATS];
      }

      if (usageStats && dataPropKey) {
        return Number(usageStats[dataPropKey]);
      }
      return 0;
    },

    // Breaks down the usageStats tier stats from:
    //
    // "usageStats" : {
    //   "storage_tier.das-sata.usage_bytes": "-1",
    //   "storage_tier.das-sata.free_bytes": "-1",
    //   "storage_tier.das-sata.capacity_bytes": "-1",
    //   "storage_tier.ssd-sata.usage_bytes": "-1",
    //   "storage_tier.ssd-sata.free_bytes": "-1",
    //   "storage_tier.ssd-sata.capacity_bytes": "-1"
    // }
    //
    // ... to this...
    //
    // "perTierUsed" : {
    //    "DAS-SATA" : {
    //      usage_bytes": "-1",
    //      free_bytes": "-1",
    //      capacity_bytes": "-1"
    //    }
    // }
    //
    formulatePerTierStats: function(usageStats) {
      var perTierUsed = null;

      if (usageStats) {
        perTierUsed = {};
        _.each( _.keys(usageStats), function(key) {
          if (key.indexOf(DataProp.STORAGE_TIER) === 0) {
            var usageProps = key.split('.'),
                statsProp,
                tierName;

            // Get the storage data prop which is the 3rd part of the key and
            // the tier name which is the 2nd key.
            // 'storage_tier.das-sata.free_bytes'
            if (usageProps.length > 2) {
              tierName = (usageProps[1] || '').toUpperCase();
              statsProp = usageProps[2];
            } else {
              // No need to proceed in populating perTierUsed.
              return;
            }

            // Form the perTierUsed object
            if (!perTierUsed[tierName]) {
              perTierUsed[tierName] = {};
            }

            perTierUsed[tierName][statsProp] = Number(usageStats[key]);
          }
        }, this);
      }

      return perTierUsed;
    },

    // Like the formulatePerTierStats() but operating on
    // the older usage stats aggregator data.
    formulatePerTierStatsOld: function(usageStats) {
      var perTierUsed = {};
      var locTierUsed = usageStats ?
          usageStats[DataProp.PER_TIER_USED] :null;
      for (var tierName in locTierUsed) {
        if (!perTierUsed[tierName]) {
          perTierUsed[tierName] = {};
        }
        perTierUsed[tierName][DataProp.TIER_USED_BYTES] =
            locTierUsed[tierName][DataProp.USED];
        perTierUsed[tierName][DataProp.TIER_CAPACITY_BYTES] =
            locTierUsed[tierName][DataProp.CAPACITY];
      }
      return perTierUsed;
    },

    // Functions (Stats Metric Formatter)
    //-----------------------------------

    // Converts a bandwidth value to a readable unit of measurement.
    // Bandwidth uses base 10 instead of base 2.
    // @param value    - bandwidth in kbps.
    // @param hasUnit  - Set to false if the UOM label isn't included and
    //                     return numeric value. Default is true.
    // Example: Converts 1000 to 1KBps
    bandwidthFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;

      // Convert to bytes since the default value coming from backend is KBs.
      var bytes = this.convertToBytes(value, this.UOM_KB);

      // Then convert to readable format plus add the unit if necessary.
      var newValue = this._convertRawBytesToUOM(
        true, bytes, hasUnit, this.UOM_KB);

      // Since it's a string, let's make sure to replace 'byte(s)' to 'B'.
      if (hasUnit) {
        return (newValue + 'ps').replace(this.UOM_B, 'B');
      }
      else {
        return newValue;
      }
    },

    // Converts a latency value to a readable unit of measurement.
    // @param value    - latency in usecs to be converted to readable format
    // @param hasUnit  - Set to false if the UOM label is not displayed.
    //                   Default is true.
    // Example: Converts 30000 to 30 ms.
    latencyFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;
      return this.round(value/1000, 2) + (hasUnit ? ' ms' : 0);
    },

    // Converts a micoseconds value to a readable unit of measurement.
    // @param value    - value in usecs to be converted to readable format
    // @param hasUnit  - Set to false if the UOM label is not displayed.
    //                   Default is true.
    // Example: Converts 30000 to 30 ms.
    microSecondsFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;
      return this.round(value/1000, 2) + (hasUnit ? ' ms' : 0);
    },

    // Converts an iops value to a readable unit of measurement.
    // @param value    - the iops that will be converted to readable format
    // @param hasUnit  - Set to false if the UOM label isn't included and
    //                   return numeric value. Default is true.
    // Example: Converts 5100 to 5.10K IOPS
    iopsFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;
      return hasUnit ? AppUtil.addCommas(String(value)) + ' IOPS' : value;
    },

    // Converts a cpu usage value to a readable format.
    // @param value    - cpu usage in parts per million
    // @param hasUnit  - Set to false if the % label isn't included and
    //                   return numeric value. Default is true.
    // Example: Convert PPM to Percentage: x(%) = x(ppm) / 10000
    cpuUsageFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;
      return this.round(value/10000, 2) + (hasUnit ? '%' : 0);
    },

    // Converts ppm (parts per million) to %
    // @param value    - cpu usage in parts per million
    // @param hasUnit  - Set to false if the UOM label is not displayed.
    //                   Default is true.
    // Example: Convert PPM to Percentage: x(%) = x(ppm) / 10000
    ppmFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;
      return this.round(value/10000, 2) + (hasUnit ? '%' : 0);
    },



    // Converts a hundreds value to raw count
    // @param value    - stat value in hundreds (x * 100)
    // @param hasUnit  - Set to false if the UOM label is not displayed.
    //                   Default is true.
    // Example: Convert pph to raw count: x (hundreds) = x
    hundredsFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;
      return this.round(value/100, 2) + (hasUnit ? '' : 0);
    },

    // Converts memory usage to a readable format.
    // @param value    - memory usage in parts per million
    // @param hasUnit  - Set to false if the % label isn't included and
    //                   return numeric value. Default is true.
    // Example: Convert PPM to Percentage: x(%) = x(ppm) / 10000
    memoryUsageFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;
      return this.round(value/10000, 2) + (hasUnit ? '%' : 0);
    },

    // Converts CPU Hz to a readable format.
    // @param value    - CPU hertz
    // @param hasUnit  - Set to false if the unit isn't included and
    //                   return numeric value. Default is true.
    // Example: Convert PPM to Percentage: x(%) = x(ppm) / 10000
    cpuHertzFormat: function(value, hasUnit) {
      // Default is true for hasUnit.
      hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;
      var symbol = hasUnit ? this.SYMBOL_HERTZ : null;
      return hasUnit ? this.prefixFormat(value, symbol) : value;
    },


    // Functions (Generic Formatter)
    //------------------------------

    // Returns the percentage value with rounding off where r is the decimal
    // place. If the value is less than 0.01, display is 'Less than 0.01%'.
    // @param value - value to be converted to percentage. Should be < 1.
    // @param r - round off value (Default is 100th decimal place)
    // @param useSymbol - use '<' symbol if true
    roundPercent: function(value, r, useSymbol) {
      value = value || 0;
      r = r || 2;
      var newValue = this.round(value * 100, r);
      if (value > 0 && newValue < (1 / Math.pow(10, r))) {
        return (useSymbol ? '<' : 'Less than ') + (1 / Math.pow(10, r))+'%';
      }
      // If percentage value we get is > 100 rounding it 100.
      if(newValue > 100){
        newValue = 100;
      }
      return newValue + '%';
    },

    // Returns the round off value where i is the decimal place.
    // Default is 100th decimal place.
    round: function(value, i) {
      value = value || 0;
      if (i !== 0) { // Allow zero value
        i = i || 2;  // But not other falsy values
      }
      return Math.round((value * Math.pow(10, i))) / Math.pow(10, i);
    },

    // Returns the floor of value where i is the decimal place.
    // Default is 100th decimal place.
    floor: function(value, i) {
      value = value || 0;
      if (i !== 0) { // Allow zero value
        i = i || 2;  // But not other falsy values
      }
      return Math.floor((value * Math.pow(10, i))) / Math.pow(10, i);
    },

    // Formats raw numeric values.
    // eg 1000 is converted to 1K
    // @param value    - Numeric value
    // @param floor    - Boolean, determines if value is roudned or floored
    // @return formatted string
    rawNumericFormat: function(value, floor) {
      var units = ["", "K", "M", "G", "T", "P"],
          returnValue = 0,
          power = 0;

      if (isNaN(value) || value === 0 || value === null) {
        return "0";
      }

      for (var i = units.length-1; i >= 0; i--) {
        if ((value / Math.pow(1000, i)) >= 1 || i === 0) {
          power = i;
          break;
        }
      }

      var valPoweredDown = value / Math.pow(1000, power);
      if (floor) {
        returnValue =
          this.formatDecimalDigits(valPoweredDown, 3, true) +
            units[power];
      }
      else {
        returnValue = Math.round(valPoweredDown * 100) / 100 + units[power];
      }

      return returnValue;
    },

    // Format based on metric name
    formatByMetricName: function(metric, value, hasUnit) {

      if ( AppUtil.endsWith(metric, "_iops") ||
           AppUtil.endsWith(metric, "_io")) {
        return this.rawNumericFormat(value);
      }

      if ( AppUtil.endsWith(metric, "_kbytes") ||
           AppUtil.endsWith(metric, "_kBps") ) {
        return this.rawNumericFormat(value * 1000);
      }

      if ( AppUtil.endsWith(metric, "_bytes")  ) {
        return this.storageFormat(value, hasUnit);
      }

      if ( AppUtil.endsWith(metric, "_usecs") ) {
        return this.microSecondsFormat(value, hasUnit);
      }

      if ( AppUtil.endsWith(metric, "_ppm") ) {
        return this.ppmFormat(value, hasUnit);
      }

      if ( AppUtil.endsWith(metric, "_pph") ) {
        return this.hundredsFormat(value, hasUnit);
      }

      // Worst case, treat it as raw numeric
      return this.rawNumericFormat(value);

    },

    // Returns the data property of a specified metric and entityType.
    // @param metric - AppConstants.METRIC_* or DataProperties.STATS_*
    // @param entityType - AppConstants.ENTITY_*
    // @param returnDefault - If true, return the metric if there's no match
    getStatsProperty: function(metric, entityType, returnDefault) {
      switch (metric) {
        case AppConstants.METRIC_IOPS:
          if (entityType === AppConstants.ENTITY_VM) {

            // TODO: Hyper-V uses Stargate stats instead of hypervisor in 3.5
            if (HypervisorUtil.hasHyperV()) {
              return DataProp.STATS_CONTROLLER_NUM_IOPS;
            }

            return DataProp.STATS_HYP_NUM_IOPS;

          }
          else if (entityType === AppConstants.ENTITY_VDISK ||
                   entityType === AppConstants.ENTITY_CONTAINER) {
            return DataProp.STATS_CONTROLLER_NUM_IOPS;
          }
          else {
            return DataProp.STATS_NUM_IOPS;
          }
          break;
        case AppConstants.METRIC_BANDWIDTH:
          if (entityType === AppConstants.ENTITY_VM) {

            // TODO: Hyper-V uses Stargate stats instead of hypervisor in 3.5
            if (HypervisorUtil.hasHyperV()) {
              return DataProp.STATS_CONTROLLER_BANDWIDTH;
            }

            return DataProp.STATS_HYP_BANDWIDTH;
          }
          else if (entityType === AppConstants.ENTITY_VDISK ||
                   entityType === AppConstants.ENTITY_CONTAINER) {
            return DataProp.STATS_CONTROLLER_BANDWIDTH;
          }
          else {
            return DataProp.STATS_BANDWIDTH;
          }
          break;
        case AppConstants.METRIC_LATENCY:
          if (entityType === AppConstants.ENTITY_VM) {

            // TODO: Hyper-V uses Stargate stats instead of hypervisor in 3.5
            if (HypervisorUtil.hasHyperV()) {
              return DataProp.STATS_CONTROLLER_AVG_IO_LATENCY;
            }

            return DataProp.STATS_HYP_AVG_IO_LATENCY;
          }
          else if (entityType === AppConstants.ENTITY_VDISK ||
                   entityType === AppConstants.ENTITY_CONTAINER) {
            return DataProp.STATS_CONTROLLER_AVG_IO_LATENCY;
          }
          else {
            return DataProp.STATS_AVG_IO_LATENCY;
          }
          break;
        case AppConstants.METRIC_CPU_USAGE:
          return DataProp.STATS_HYP_CPU_USAGE;
        case AppConstants.METRIC_MEMORY_USAGE:
          return DataProp.STATS_HYP_MEMORY_USAGE;
        case AppConstants.METRIC_USAGE_SUMMARY:
          var ClusterManager = require('managers/ClusterManager');
          if (ClusterManager.isClusterFFEnabled(
              AppConstants.FFLAGS.ARITHMOS_USAGE_STATS)) {
            // Check if logical entity or physical
            if (entityType === AppConstants.ENTITY_CONTAINER) {
              return DataProp.NEW_TOT_USED_LOG;
            }
            else {
              return DataProp.NEW_STATS_TRANSFORMED_USAGE;
            }
          }
          else {
            return DataProp.STATS_TRANSFORMED_USAGE;
          }
          return DataProp.NEW_STATS_TRANSFORMED_USAGE;
        case AppConstants.METRIC_PHYSICAL_USAGE:
          return DataProp.STATS_UNTRANSFORMED_USAGE;

        case AppConstants.METRIC_BW_TRANSFERRED:
          return DataProp.STATS_REP_BW_TRANSFERRED;
        case AppConstants.METRIC_BW_RECEIVED:
          return DataProp.STATS_REP_BW_RECEIVED;

        // Default - check if to return same metric
        default:
          if (returnDefault) {
            return metric;
          }
      }
    },

    // Returns stats value based on the property which is taken from a model
    // with proper formatting. This requires that model has stats object.
    // @param prop  - the stats property
    // @param model - the entity model in JSON format
    // @param hasUnit - set to false to disable formatting and just return
    //                  the value. Default is true.
    getStatsValue: function(prop, model, hasUnit) {
      if (model && model.stats) {
        var value = model.stats[ prop ];

        hasUnit = (typeof hasUnit === 'undefined') ? true : hasUnit;

        if (hasUnit) {
          return this.statsFormat(prop, value, true);
        } else {
          return this.isValidStats(value) ? value :
              AppConstants.STATS_NOT_AVAILABLE;
        }

      } else {
        return AppConstants.STATS_NOT_AVAILABLE;
      }
    },

    // Check if value of stats is valid
    isValidStats: function(value) {
      /* jshint eqeqeq: false */
      return (typeof value !== 'undefined' && value !== null  &&
              !isNaN(value) && value != AppConstants.STATS_NO_VALUE);
    },

    // TODO: Ideally, we want to get the threshold from the backend.
    //       Collaborate with Gateway, NCC and Alert team how to get it.
    // Check if there's enough space in the cluster.
    // This is based from the alerts calculation.
    // Return the following health status based on the usage:
    // - Good    : 0-74%
    // - Warning : 75-89%
    // - Critical: 90-100%
    getStorageStatsHealth: function(used, capacity) {
      used = used || 0;
      capacity = capacity || 1;
      var percent = (used / capacity) * 100;
      if (percent >= 90) {
        return AppConstants.HEALTH_STATUS.CRITICAL;
      } else if (percent >= 75 && percent < 90) {
        return AppConstants.HEALTH_STATUS.WARNING;
      } else {
        return AppConstants.HEALTH_STATUS.GOOD;
      }
    },

    // Returns start time in millis based on how many last hours you want.
    getStatsStartTime: function(hours) {
      hours = hours || AppConstants.STATS_LAST_HOURS;
      // Get the last hours (3600000 millis in 1 hour)
      var timeRange = 3600000 * hours;
      return new Date().getTime() - timeRange;
    },

    // Returns current time in millis for stats.
    getStatsCurrentTime: function(hours) {
      return new Date().getTime();
    },

    // Returns the sampling interval based on the metrics
    getSamplingIntervalSecs: function(metricIds) {
      var metrics = _.isArray(metricIds) ? metricIds : [ metricIds ];
      // Check if the metrics is hypervisor, then set the sampling interval
      // to 60 secs.
      for (var i=0; i < metricIds.length; i++) {
        if (this.isHypervisorStats(metrics[i])) {
          return AppConstants.HYPERVISOR_SAMPLING_INTERVAL_SECS;
        }
      }
      return AppConstants.DEFAULT_SAMPLING_INTERVAL_SECS;
    },

    // Converts the storage value to bytes
    // @param value   - the value that will be converted to bytes
    // @param unit    - default is GB or GiB
    // @param isDecimal - If true use decimal (GB), otherwise binary (GiB).
    //                    Default is false since we use binary format.
    convertToBytes: function(value, unit, isDecimal) {
      var divider = isDecimal ? 1000 : 1024;

      // Determine default unit
      if (typeof unit === 'undefined') {
        unit = isDecimal ? this.UOM_GB : this.UOM_GIB;
      }

      // Create the units array
      var units;
      if (isDecimal) {
        units = [ this.UOM_B, this.UOM_KB, this.UOM_MB, this.UOM_GB,
                  this.UOM_TB, this.UOM_PB ];
      } else {
        units = [ this.UOM_B, this.UOM_KIB, this.UOM_MIB, this.UOM_GIB,
                  this.UOM_TIB, this.UOM_PIB ];
      }

      // Check if value is numeric or 0
      if (isNaN(value) || value === 0) {
        return 0;
      }

      // Convert to bytes based on the unit
      for (var i = units.length-1; i >= 0; i--) {
        /* jshint eqeqeq: false */
        if (unit == units[i]) {
          return value * Math.pow(divider, i);
        }
      }
    },

    // Adds <span> to stats unit for styling purpose. Examples:
    // 1) '10 GB' to '10 <span class="n-stats-unit">GB</span>'.
    // 2) '8.52%' to '8.52 <span class="n-stats-unit">%</span>'.
    // @param value - The value with unit to be parsed.
    addStyleToUnit: function(value) {
      if (!value) {
        throw new Error('Value is required.');
      }

      // Return if not String. Don't change the value.
      if (!_.isString(value) || value === AppConstants.STATS_NOT_AVAILABLE) {
        return value;
      }

      // Insert space if there's percentage
      value = value.replace('%',' %');

      // Apply the style unit if applicable
      if (value.split(' ').length === 2) {
        var values = value.split(' ');
        return this.TEMPLATE_UNIT({
          value : values[0],
          unit  : values[1]
        });
      } else {
        AppUtil.log('Error: To stylize stats, the value should have the ' +
          'format: <numeric value> <unit>. Value: ' + value);
        return value;
      }
    },

    // Returns the label of a metric type
    getMetricLabel: function(metric, entityType) {
      var labelMetric;

      // Get the metric label
      switch (metric) {
        // Storage usage
        case AppConstants.METRIC_USAGE_SUMMARY:
          labelMetric = 'Usage Summary';
          break;

        case AppConstants.METRIC_PHYSICAL_USAGE:
        case DataProp.STATS_TRANSFORMED_USAGE:
        case DataProp.STATS_UNTRANSFORMED_USAGE:
        case DataProp.TOT_USED_PHY:
        case DataProp.TOT_CAPACITY:
        case DataProp.TOT_USED_RESERVED:
        case DataProp.TOT_RES_CAPACITY:
        case DataProp.FREE_UNRESERVED_CAPACITY:
          labelMetric = 'Used (Physical)';
          break;

        case DataProp.TOT_USED_LOG:
        case DataProp.LOGICAL_USAGE_BYTES:
          labelMetric = 'Used (Logical)';
          break;

        case DataProp.STATS_REP_NUM_TRANSMITTED_BYTES:
        case DataProp.STATS_REP_TOT_TRANSMITTED_BYTES:
          labelMetric = 'Transmitted Size';
          break;

        case DataProp.STATS_REP_NUM_RECEIVED_BYTES:
        case DataProp.STATS_REP_TOT_RECEIVED_BYTES:
          labelMetric = 'Received Size';
          break;

        case AppConstants.METRIC_BW_TRANSFERRED:
        case DataProp.STATS_REP_BW_TRANSFERRED:
          labelMetric = 'Bandwidth Tx';
          break;

        case AppConstants.METRIC_BW_RECEIVED:
        case DataProp.STATS_REP_BW_RECEIVED:
          labelMetric = 'Bandwidth Rx';
          break;

        // Bandwidth
        case AppConstants.METRIC_BANDWIDTH:
        case DataProp.STATS_READ_BANDWIDTH:
        case DataProp.STATS_WRITE_BANDWIDTH:
        case DataProp.STATS_HYP_READ_BANDWIDTH:
        case DataProp.STATS_HYP_WRITE_BANDWIDTH:
        case AppConstants.METRIC_BW_TRANSFERRED:
        case AppConstants.METRIC_BW_RECEIVED:
        case DataProp.STATS_REP_BW_TRANSFERRED:
        case DataProp.STATS_REP_BW_RECEIVED:
        case DataProp.STATS_CONTROLLER_READ_BANDWIDTH:
        case DataProp.STATS_CONTROLLER_WRITE_BANDWIDTH:
          labelMetric = 'I/O Bandwidth';
          break;
        case DataProp.STATS_HYP_BANDWIDTH:
          labelMetric = 'Hypervisor I/O Bandwidth';
          break;
        case DataProp.STATS_BANDWIDTH:
          labelMetric = 'Disk I/O Bandwidth';
          break;
        case DataProp.STATS_CONTROLLER_BANDWIDTH:
          labelMetric = 'Controller I/O Bandwidth';
          break;

        // Latency
        case AppConstants.METRIC_LATENCY:
        case DataProp.STATS_AVG_READ_IO_LATENCY:
        case DataProp.STATS_AVG_WRITE_IO_LATENCY:
        case DataProp.STATS_HYP_AVG_READ_IO_LATENCY:
        case DataProp.STATS_HYP_AVG_WRITE_IO_LATENCY:
          labelMetric = 'Avg I/O Latency';
          break;
        case DataProp.STATS_HYP_AVG_IO_LATENCY:
          labelMetric = 'Hypervisor Avg I/O Latency';
          break;
        case DataProp.STATS_AVG_IO_LATENCY:
          labelMetric = 'Disk Avg I/O Latency';
          break;
        case DataProp.STATS_CONTROLLER_AVG_IO_LATENCY:
          labelMetric = 'Controller Avg I/O Latency';
          break;

        // IOPS
        case AppConstants.METRIC_IOPS:
        case DataProp.STATS_NUM_READ_IOPS:
        case DataProp.STATS_NUM_WRITE_IOPS:
        case DataProp.STATS_HYP_NUM_READ_IOPS:
        case DataProp.STATS_HYP_NUM_WRITE_IOPS:
        case DataProp.STATS_CONTROLLER_NUM_READ_IOPS:
        case DataProp.STATS_CONTROLLER_NUM_WRITE_IOPS:
          labelMetric = 'IOPS';
          break;
        case DataProp.STATS_HYP_NUM_IOPS:
          labelMetric = 'Hypervisor IOPS';
          break;
        case DataProp.STATS_NUM_IOPS:
          labelMetric = 'Disk IOPS';
          break;
        case DataProp.STATS_CONTROLLER_NUM_IOPS:
          labelMetric = 'Controller IOPS';
          break;

        // CPU Usage
        case AppConstants.METRIC_CPU_USAGE:
        case DataProp.STATS_HYP_CPU_USAGE:
          labelMetric = 'CPU Usage';
          break;

        // Memory Usage
        case AppConstants.METRIC_MEMORY_USAGE:
        case DataProp.STATS_HYP_MEMORY_USAGE:
          labelMetric = 'Memory Usage';
          break;

        // PPM Stats
        case DataProp.STATS_READ_IO_PPM:
        case DataProp.STATS_WRITE_IO_PPM:
        case DataProp.STATS_RANDOM_IO_PPM:
        case DataProp.STATS_SEQ_IO_PPM:
          labelMetric = 'I/O PPM';
          break;

        // Hz Stats
        case DataProp.CPU_CAPACITY:
        case DataProp.VM_CPU_RESERVED:
          labelMetric = 'CPU Capacity';
          break;

        default:
          // Use the original value if there's no label
          labelMetric = metric;
          break;
      }

      // Get the entity type label (if necessary)
      if (entityType === AppConstants.ENTITY_CLUSTER) {
        // So far, we use cluster-wide label
        labelMetric = AppConstants.LABEL_CLUSTER_WIDE + ' ' + labelMetric;
      }

      return labelMetric;
    },

    // Returns the storage value label with format but if the value is too
    // small it will use a stoage value template.
    // @param storageValue - value in storage bytes.
    // @param minimumLabel - Label to return if the storage value is too
    //                       small.
    getStorageLabelWithMinimumLimit: function(storageValue, minimumLabel) {
      if (storageValue <= 0) {
        return AppConstants.STATS_NOT_AVAILABLE;
      }
      else if (storageValue < this.MINIMUM_STORAGE_LIMIT &&
               storageValue > 0) {
        return minimumLabel;
      }
      return this.storageFormat(storageValue);
    },

    // Functions (Prefix Multiplier)
    //------------------------------

    // Converts numerical value to readable format with prefix multiplier
    // @param value   - The numerical value that will be converted
    // @param symbol    - The symbol appended to the prefix multiplier
    // Example: Converts 1000000 Hz to 1MHz
    prefixFormat: function(value, symbol) {
      // Prefix array
      var prefix = [ '',  // Plain
                     'K', // Kilo
                     'M', // Mega
                     'G', // Giga
                     'T', // Tera
                     'P'  // Penta
                    ];

      if (isNaN(value) || value === 0 || value === null) {
        return 0 + (symbol ? (' ' + symbol) : 0);
      }

      for (var i = prefix.length-1; i >= 0; i--) {
        if ((value / Math.pow(1000, i)) >= 1 || i === 0) {
          // Search for the correct symbol then round off
          return Math.round((value / Math.pow(1000, i)) * 100) / 100 +
                  (symbol ? (' ' + prefix[i] + symbol) : 0);
        }
      }
    },

    // Functions (Aggregator)
    //-----------------------

    // Returns the total value of all the model's given data property
    // @param collection     - instance of BaseCollection
    // @param prop           - property
    // @param hasUnit        - include a unit
    // @param multiplierProp - multiplier for the data value
    aggregate: function(collection, prop, hasUnit, multiplierProp) {
      if (!(collection && collection.models)) {
        throw new Error('collection is not an instance of BaseCollection');
      }
      var total = 0;
      _.each(collection.models, function(model) {
        // Get the data value and multiply with the multiplierProp if needed
        total += (model.get(prop) || 0)  * (model.get(multiplierProp) || 1);
      });
      return this.statsFormat(prop, total, hasUnit);
    },

    // Functions (Chart Y-Axis Formatter)
    //-----------------------------------

    // Parses the data that comes from the y-axis of chart for consistency.
    // @param metric     - Metric type value from AppConstants.METRIC_*  OR
    //                     Property from DataProperties.STATS_*.
    // @param value      - Stats value to be converted to readable format.
    // @param hasUnit    - Set to false if the UOM label isn't included and
    //                     return numeric value. Default is true.
    formatStatsChartYAxis: function(metric, value, hasUnit) {
      var statsValue = this.statsFormat(metric, value, hasUnit);

      // Show only 2 decimal points when necessary. Preserve the symbol.
      if (statsValue && _.isString(statsValue)) {
        var y = statsValue.split(' '),
            stat = (isNaN(y[0]) ? y[0] : this.round(y[0], 2) ),
            symbol = (y.length > 1 ? y[1] : '');

        statsValue = stat + ' ' + symbol;
      }

      return statsValue;
    },

    // Functions (Boolean)
    //--------------------

    // Returns true if the metric is related to storage
    isStorageStats: function(metric) {
      // Starting 4.1, majority of new storage stats starts with 'storage.'
      if (metric.indexOf('storage.') === 0) {
        return true;
      }

      // And still double check for legacy storage stats
      switch (metric) {
        /* falls through */
        // Memory capacity-related stats
        case DataProp.MEM_CAPACITY:
        case DataProp.VM_MEM_CAPACITY:
        case DataProp.VM_MEM_RESERVED:
        case AppConstants.METRIC_USAGE_SUMMARY:
        case AppConstants.METRIC_PHYSICAL_USAGE:
        case DataProp.STATS_TRANSFORMED_USAGE:
        case DataProp.STATS_UNTRANSFORMED_USAGE:
        case DataProp.NEW_TOT_USED_PHY:
        case DataProp.TOT_USED_PHY:
        case DataProp.TOT_USED_LOG:
        case DataProp.TOT_CAPACITY:
        case DataProp.TOT_USED_RESERVED:
        case DataProp.TOT_RES_CAPACITY:
        case DataProp.FREE_UNRESERVED_CAPACITY:
        case DataProp.STATS_REP_NUM_TRANSMITTED_BYTES:
        case DataProp.STATS_REP_NUM_RECEIVED_BYTES:
        case DataProp.STATS_REP_TOT_TRANSMITTED_BYTES:
        case DataProp.STATS_REP_TOT_RECEIVED_BYTES:
        case DataProp.PD_TOTAL_USER_BYTES:
        // Dedup stats that returning bytes
        case DataProp.CONTENT_CACHE_PHYSICAL_MEMORY_USAGE_BYTES:
        case DataProp.CONTENT_CACHE_PHYSICAL_SSD_USAGE_BYTES:
        case DataProp.CONTENT_CACHE_LOGICAL_MEMORY_USAGE_BYTES:
        case DataProp.CONTENT_CACHE_LOGICAL_SSD_USAGE_BYTES:
        case DataProp.CONTENT_CACHE_SAVED_MEMORY_USAGE_BYTES:
        case DataProp.CONTENT_CACHE_SAVED_SSD_USAGE_BYTES:
        case DataProp.DEDUP_FINGERPRINT_CLEARED_BYTES:
        case DataProp.DEDUP_FINGERPRINT_ADDED_BYTES:
          return true;
        default:
          return false;
      }
    },

    // NOTE: ENG-20925 we move the storage format from base 10 to base 2
    // Commenting out the isStorageBinaryStats as we will no longer need it.
    // Returns true if the metric is related to storage
    // isStorageBinaryStats: function(metric) {
    //  switch (metric) {
    //    default:
    //      return false;
    //  }
    //},

    // Returns true if the metric is related to iops
    isIOPSStats: function(metric) {
      switch (metric) {
        case AppConstants.METRIC_IOPS:
        case DataProp.STATS_NUM_IOPS:
        case DataProp.STATS_NUM_READ_IOPS:
        case DataProp.STATS_NUM_WRITE_IOPS:
        case DataProp.STATS_HYP_NUM_IOPS:
        case DataProp.STATS_HYP_NUM_READ_IOPS:
        case DataProp.STATS_HYP_NUM_WRITE_IOPS:
        case DataProp.STATS_CONTROLLER_NUM_IOPS:
        case DataProp.STATS_CONTROLLER_NUM_READ_IOPS:
        case DataProp.STATS_CONTROLLER_NUM_WRITE_IOPS:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is related to io latency
    isLatencyStats: function(metric) {
      switch (metric) {
        case AppConstants.METRIC_LATENCY:
        case DataProp.STATS_AVG_IO_LATENCY:
        case DataProp.STATS_AVG_READ_IO_LATENCY:
        case DataProp.STATS_AVG_WRITE_IO_LATENCY:
        case DataProp.STATS_HYP_AVG_IO_LATENCY:
        case DataProp.STATS_HYP_AVG_READ_IO_LATENCY:
        case DataProp.STATS_HYP_AVG_WRITE_IO_LATENCY:
        case DataProp.STATS_CONTROLLER_AVG_IO_LATENCY:
        case DataProp.STATS_CONTROLLER_AVG_READ_IO_LATENCY:
        case DataProp.STATS_CONTROLLER_AVG_WRITE_IO_LATENCY:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is related to io bandwidth
    isBandwidthStats: function(metric) {
      switch (metric) {
        case AppConstants.METRIC_BANDWIDTH:
        case DataProp.STATS_BANDWIDTH:
        case DataProp.STATS_READ_BANDWIDTH:
        case DataProp.STATS_WRITE_BANDWIDTH:
        case DataProp.STATS_HYP_BANDWIDTH:
        case DataProp.STATS_HYP_READ_BANDWIDTH:
        case DataProp.STATS_HYP_WRITE_BANDWIDTH:
        case AppConstants.METRIC_BW_TRANSFERRED:
        case AppConstants.METRIC_BW_RECEIVED:
        case DataProp.STATS_REP_BW_TRANSFERRED:
        case DataProp.STATS_REP_BW_RECEIVED:
        case DataProp.STATS_CONTROLLER_BANDWIDTH:
        case DataProp.STATS_CONTROLLER_READ_BANDWIDTH:
        case DataProp.STATS_CONTROLLER_WRITE_BANDWIDTH:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is related to ppm
    isPPMStats: function(metric) {
      switch (metric) {
        case AppConstants.METRIC_MEMORY_USAGE:
        case AppConstants.METRIC_CPU_USAGE:
        case DataProp.STATS_READ_IO_PPM:
        case DataProp.STATS_WRITE_IO_PPM:
        case DataProp.STATS_RANDOM_IO_PPM:
        case DataProp.STATS_SEQ_IO_PPM:
        case DataProp.STATS_CONTROLLER_READ_IO_PPM:
        case DataProp.STATS_CONTROLLER_WRITE_IO_PPM:
        case DataProp.CONTENT_CACHE_HIT_PPM:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is a hundreds stat (x * 100)
    isHundredsStats: function(metric) {
      /*jshint onecase: true */
      switch (metric) {
        case DataProp.CONTENT_CACHE_NUM_DEDUP_REF_COUNT_PPH:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is related to CPU Usage
    isCPUUsageStats: function(metric) {
      switch (metric) {
        case AppConstants.METRIC_CPU_USAGE:
        case DataProp.STATS_HYP_CPU_USAGE:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is related to Memory Usage
    isMemoryUsageStats: function(metric) {
      switch (metric) {
        case AppConstants.METRIC_MEMORY_USAGE:
        case DataProp.STATS_HYP_MEMORY_USAGE:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is related to Hz
    isHzStats: function(metric) {
      switch (metric) {
        case DataProp.CPU_CAPACITY:
        case DataProp.VM_CPU_RESERVED:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is a raw numeric number
    isRawNumericStats: function(metric) {
      switch (metric) {
        case DataProp.CONTENT_CACHE_NUM_HITS:
        case DataProp.CONTENT_CACHE_NUM_LOOKUPS:
          return true;
        /* falls through */
        default:
          return false;
      }
    },

    // Returns true if the metric is related to Hz
    isHypervisorStats: function(metric) {
      return (metric && metric.toLowerCase().indexOf('hypervisor') === 0);
    },

    // Process incoming stats for the analysis charts
    // @param metric - the stats are for this metric
    // @param stats - raw stats from the backend
    processAnalysisStats: function(metric, stats) {
      for(var i=0; i<stats.length;i++) {
        var formattedValue = this.statsFormat(metric,
          stats[i][1], true);
        if ( formattedValue === AppConstants.STATS_NOT_AVAILABLE) {
          formattedValue = null;
        }
        // [0] is the time, [1] is the raw value for the chart
        // [2] is the formattedValue for the header.

        stats[i][2] = formattedValue;
      }
      return stats;
    },

    // Storage stats are in bytes, Flotr  currently (06/01/2014) does not
    // support very large integers very well. We therefore convert them to
    // MBs for plotting purpose.[Not using the statsFormat() because we do
    // not want to round-off values, we need to convert them back to bytes]
    // Converting bytes to MegaBytes or MebiBytes.
    // @param value - The value that needs to be processed.
    // @param convertToBytes - Whether to convert back to bytes.
    processStorageStats: function(value, convertToBytes) {
        value = convertToBytes ?
          ( value * this.STORAGE_BINARY_UOM.MiB) :
          ( value / this.STORAGE_BINARY_UOM.MiB);

       return value;
    }

  };

