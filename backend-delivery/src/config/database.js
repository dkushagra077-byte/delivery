const { supabase, isLiveSupabase } = require('./supabase');

module.exports = {
  db: supabase,
  isLiveSupabase
};
