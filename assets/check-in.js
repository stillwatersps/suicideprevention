// Daily check-in: steps, suggestions, reflections, journal, and Your journey.
// Everything lives in one object in this page's memory. Nothing is sent anywhere, and nothing is
// stored: closing or reloading the page erases it, and "Delete everything" erases it sooner.
// Every word this page can show is written in the page itself, so reviewers see all of it. This
// script only shows, hides, copies, and orders that text. It never reads what was typed to choose
// a suggestion, and it never scores anything.
(function () {
  var body = document.querySelector('.ci-body');
  if (!body) return;
  var root = document.documentElement;
  var lang = root.lang || 'en';

  var state;
  function emptyState() {
    return { feeling: '', feelingLabel: '', needs: [], checkins: [], reflections: {}, explore: [],
      enjoyed: [], learned: [], entries: [], editing: null, prompt: '', step: 0, nextId: 1 };
  }
  state = emptyState();

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
  function show(el, on) { if (el) el.classList.toggle('ci-off', !on); }
  // Scroll first, so the pinned crisis strip's scroll-padding applies, then focus without scrolling again.
  function focusOn(el) {
    if (!el) return;
    if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|TEXTAREA)$/.test(el.tagName)) el.setAttribute('tabindex', '-1');
    el.scrollIntoView({ block: 'start' });
    el.focus({ preventScroll: true });
  }
  function labelText(input) {
    var spans = input.parentNode.querySelectorAll('span:not(.ci-light)');
    return spans.length ? spans[spans.length - 1].textContent.trim() : input.value;
  }

  root.classList.add('ci-ready');

  // ---- Sections as tabs. Without this script they are all shown, one after another.
  var panels = $$('.ci-panel', body);
  var tabs = $$('.ci-tabs a', body);
  function showPanel(id) {
    panels.forEach(function (panel) { show(panel, panel.id === id); });
    tabs.forEach(function (tab) {
      if (tab.getAttribute('href') === '#' + id) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
    });
  }
  function panelFor(hash) {
    var target = hash && document.getElementById(hash.slice(1));
    var panel = target && target.closest('.ci-panel');
    return panel ? panel.id : null;
  }
  // Show the section a link points to, then scroll to it: the browser can't scroll to something hidden.
  function followHash() {
    var target = location.hash && document.getElementById(location.hash.slice(1));
    var id = panelFor(location.hash);
    if (!id) { if (!location.hash || location.hash === '#main') showPanel('ci-today'); return; }
    showPanel(id);
    var step = target.closest('.ci-step');
    if (step) { goToStep(steps.indexOf(step)); return; }
    if (target.closest('.ci-result') && result.classList.contains('ci-off')) { goToStep(0); return; }
    target.scrollIntoView({ block: 'start' });
  }
  window.addEventListener('hashchange', followHash);
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function (event) {
      var href = tab.getAttribute('href');
      var id = panelFor(href);
      if (!id) return;
      event.preventDefault();
      showPanel(id);
      if (location.hash === href) focusOn(document.getElementById(href.slice(1)));
      else { history.pushState(null, '', href); focusOn(document.getElementById(href.slice(1))); }
    });
  });
  showPanel(panelFor(location.hash) || 'ci-today');

  // ---- Today: one question at a time.
  var steps = $$('.ci-step', body);
  var stepList = $('.ci-steps', body);
  var result = $('#ci-result', body);
  show(stepList, false);
  show(result, false);

  function goToStep(n) {
    state.step = Math.max(0, Math.min(steps.length - 1, n));
    show(stepList, true);
    show(result, false);
    steps.forEach(function (step, i) { show(step, i === state.step); });
    showPanel('ci-today');
    focusOn(steps[state.step]);
  }
  $$('[data-ci-start]').forEach(function (start) {
    start.addEventListener('click', function (event) {
      event.preventDefault();
      goToStep(0);
    });
  });
  steps.forEach(function (step, i) {
    var next = $('.ci-next', step);
    var skip = $('.ci-skip', step);
    var back = $('.ci-back', step);
    var finish = $('.ci-finish', step);
    if (next) next.addEventListener('click', function () { goToStep(i + 1); });
    if (back) back.addEventListener('click', function () { goToStep(i - 1); });
    if (skip) skip.addEventListener('click', function () {
      $$('input', step).forEach(function (input) { input.checked = false; });
      $$('textarea', step).forEach(function (box) { box.value = ''; });
      goToStep(i + 1);
    });
    if (finish) finish.addEventListener('click', finishCheckIn);
  });

  // ---- Suggestions, picked only from the feeling and needs chosen, from the lists on the page.
  var shown = {};
  function bankItems(group) {
    return $$('.ci-bank[data-group="' + group + '"] li', body);
  }
  function ranked(group, tags) {
    var items = bankItems(group);
    var fits = items.filter(function (li) {
      var wanted = (li.getAttribute('data-for') || '').split(/\s+/);
      return tags.some(function (tag) { return wanted.indexOf(tag) !== -1; });
    });
    var rest = items.filter(function (li) { return fits.indexOf(li) === -1; });
    return fits.concat(rest);
  }
  function fillSuggestion(box, tags, step) {
    var group = box.getAttribute('data-group');
    var list = ranked(group, tags);
    if (!list.length) return;
    var at = shown[group] === undefined ? 0 : (shown[group] + (step || 0)) % list.length;
    shown[group] = at;
    box._list = list;
    var text = $('.ci-suggestion-text', box);
    text.textContent = list[at].textContent.trim();
    box.classList.remove('is-set-aside');
  }
  function finishCheckIn() {
    var feeling = $('input[name="ci-feeling"]:checked', body);
    state.feeling = feeling ? feeling.value : '';
    state.feelingLabel = feeling ? labelText(feeling) : '';
    state.needs = $$('#ci-step-need input:checked', body).map(function (input) { return input.value; });
    if (state.feeling || state.needs.length) state.checkins.push(new Date());
    var tags = (state.feeling ? [state.feeling] : []).concat(state.needs);
    shown = {};
    $$('#ci-result .ci-suggestion', body).forEach(function (box) { fillSuggestion(box, tags, 0); });
    $('.ci-fill-feeling', result).textContent = state.feelingLabel;
    show($('.ci-chosen', result), Boolean(state.feeling));
    show($('.ci-talk-first', result), state.needs.indexOf('talk') !== -1);
    show($('.ci-set-aside', result), false);
    show($('.ci-kept-note', result), false);
    show(stepList, false);
    show(result, true);
    renderJourney();
    focusOn(result);
  }
  $('.ci-restart', body).addEventListener('click', function () { goToStep(0); });

  function currentTags(box) {
    if (box.getAttribute('data-group') === 'idea') {
      return $$('.ci-rediscover-something input:checked', body).map(function (input) { return input.value; });
    }
    return (state.feeling ? [state.feeling] : []).concat(state.needs);
  }
  $$('.ci-suggestion', body).forEach(function (box) {
    var scope = box.closest('.ci-result') || box.closest('.ci-rediscover-something');
    $('.ci-another', box).addEventListener('click', function () {
      fillSuggestion(box, currentTags(box), 1);
      show($('.ci-set-aside', scope), false);
    });
    $('.ci-not-today', box).addEventListener('click', function () {
      box.classList.add('is-set-aside');
      var note = $('.ci-set-aside', scope) || $('.ci-set-aside', body);
      show(note, true);
    });
    $('.ci-keep-idea', box).addEventListener('click', function () {
      var text = $('.ci-suggestion-text', box).textContent.trim();
      if (text && state.explore.indexOf(text) === -1) state.explore.push(text);
      show($('.ci-kept-note', body), true);
      renderJourney();
    });
  });

  // ---- Rediscover.
  var idea = $('.ci-idea', body);
  show(idea, false);
  $('.ci-show-idea', body).addEventListener('click', function () {
    shown.idea = undefined;
    fillSuggestion(idea, currentTags(idea), 0);
    show(idea, true);
    focusOn($('.ci-suggestion-text', idea));
  });
  $('.ci-suggestion-text', idea).setAttribute('tabindex', '-1');
  $$('.ci-card', body).forEach(function (card) {
    $('.ci-keep-reflection', card).addEventListener('click', function () {
      var key = card.getAttribute('data-reflection');
      var answer = $('textarea', card).value.trim();
      if (answer) {
        state.reflections[key] = { question: $('label', card).textContent.trim(), answer: answer };
        show($('.ci-kept-reflection-note', body), true);
      } else {
        delete state.reflections[key];
      }
      renderJourney();
    });
  });

  // ---- Journal.
  var entryBox = $('#ci-entry', body);
  var promptLine = $('.ci-prompt-chosen', body);
  var addButton = $('.ci-add-entry', body);
  var cancelEdit = $('.ci-cancel-edit', body);
  function setPrompt(text) {
    state.prompt = text;
    $('.ci-fill-prompt', body).textContent = text;
    show(promptLine, Boolean(text));
  }
  function setEditing(id) {
    state.editing = id;
    addButton.classList.toggle('is-editing', id !== null);
    show(cancelEdit, id !== null);
  }
  setPrompt('');
  setEditing(null);
  $$('.ci-prompt', body).forEach(function (button) {
    button.addEventListener('click', function () {
      setPrompt(button.textContent.trim());
      focusOn(entryBox);
    });
  });
  $('.ci-prompt-clear', body).addEventListener('click', function () { setPrompt(''); focusOn(entryBox); });
  function moodChoice() { return $('input[name="ci-mood"]:checked', body); }
  function clearJournalForm() {
    entryBox.value = '';
    var mood = moodChoice();
    if (mood) mood.checked = false;
    setPrompt('');
    setEditing(null);
  }
  addButton.addEventListener('click', function () {
    var text = entryBox.value.trim();
    if (!text) { focusOn(entryBox); return; }
    var mood = moodChoice();
    var data = { text: text, prompt: state.prompt, mood: mood ? labelText(mood) : '', moodValue: mood ? mood.value : '' };
    if (state.editing !== null) {
      state.entries.forEach(function (entry) {
        if (entry.id === state.editing) { entry.text = data.text; entry.prompt = data.prompt; entry.mood = data.mood; entry.moodValue = data.moodValue; }
      });
    } else {
      data.id = state.nextId++;
      data.date = new Date();
      state.entries.unshift(data);
    }
    clearJournalForm();
    renderEntries();
    focusOn($('#ci-entries-title', body));
  });
  cancelEdit.addEventListener('click', function () { clearJournalForm(); focusOn(entryBox); });

  function when(date) {
    try {
      return date.toLocaleString(lang, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch (_) { return date.toLocaleString(); }
  }
  var entryTemplate = $('#ci-entry-template', body);
  var entryList = $('.ci-entries', body);
  $('#ci-entries-title', body).setAttribute('tabindex', '-1');
  function renderEntries() {
    entryList.textContent = '';
    state.entries.forEach(function (entry) {
      var item = entryTemplate.content.firstElementChild.cloneNode(true);
      $('.ci-entry-date', item).textContent = when(entry.date);
      $('.ci-entry-mood', item).textContent = entry.mood;
      show($('.ci-entry-mood', item), Boolean(entry.mood));
      $('.ci-entry-prompt', item).textContent = entry.prompt;
      show($('.ci-entry-prompt', item), Boolean(entry.prompt));
      $('.ci-entry-text', item).textContent = entry.text;
      $('.ci-edit-entry', item).addEventListener('click', function () {
        entryBox.value = entry.text;
        setPrompt(entry.prompt);
        $$('input[name="ci-mood"]', body).forEach(function (input) { input.checked = input.value === entry.moodValue; });
        setEditing(entry.id);
        focusOn(entryBox);
      });
      $('.ci-delete-entry', item).addEventListener('click', function () {
        state.entries = state.entries.filter(function (other) { return other.id !== entry.id; });
        if (state.editing === entry.id) clearJournalForm();
        renderEntries();
        focusOn($('#ci-entries-title', body));
      });
      entryList.appendChild(item);
    });
    show($('.ci-empty-entries', body), state.entries.length === 0);
  }

  // ---- Your journey.
  var itemTemplate = $('#ci-item-template', body);
  function renderList(selector, items, remove) {
    var list = $(selector, body);
    list.textContent = '';
    items.forEach(function (text, index) {
      var item = itemTemplate.content.firstElementChild.cloneNode(true);
      $('.ci-item-text', item).textContent = text;
      $('.ci-remove-item', item).addEventListener('click', function () { remove(index); renderJourney(); });
      list.appendChild(item);
    });
  }
  function renderCalendar() {
    var box = $('.ci-calendar', body);
    box.textContent = '';
    var today = new Date();
    var first = new Date(today.getFullYear(), today.getMonth(), 1);
    var days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    var marked = {};
    state.checkins.forEach(function (date) {
      if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) marked[date.getDate()] = true;
    });
    var grid = document.createElement('div');
    grid.className = 'ci-cal-grid';
    grid.setAttribute('aria-hidden', 'true');
    for (var w = 0; w < 7; w++) {
      var head = document.createElement('span');
      head.className = 'ci-cal-head';
      var sample = new Date(2026, 10, 1 + w); // November 1, 2026 was a Sunday
      try { head.textContent = sample.toLocaleDateString(lang, { weekday: 'narrow' }); } catch (_) { head.textContent = ''; }
      grid.appendChild(head);
    }
    for (var blank = 0; blank < first.getDay(); blank++) grid.appendChild(document.createElement('span'));
    for (var d = 1; d <= days; d++) {
      var cell = document.createElement('span');
      cell.className = 'ci-cal-day' + (marked[d] ? ' is-marked' : '') + (d === today.getDate() ? ' is-today' : '');
      cell.textContent = String(d);
      grid.appendChild(cell);
    }
    box.appendChild(grid);
    show($('.ci-empty-checkins', body), state.checkins.length === 0);
  }
  function renderJourney() {
    renderCalendar();
    var keys = Object.keys(state.reflections);
    renderList('.ci-list-reflections', keys.map(function (key) {
      return state.reflections[key].question + ' ' + state.reflections[key].answer;
    }), function (index) { delete state.reflections[keys[index]]; });
    show($('.ci-empty-reflections', body), keys.length === 0);
    renderList('.ci-list-explore', state.explore, function (index) { state.explore.splice(index, 1); });
    show($('.ci-empty-explore', body), state.explore.length === 0);
    renderList('.ci-list-enjoyed', state.enjoyed, function (index) { state.enjoyed.splice(index, 1); });
    renderList('.ci-list-learned', state.learned, function (index) { state.learned.splice(index, 1); });
  }
  $$('.ci-add-item', body).forEach(function (button) {
    button.addEventListener('click', function () {
      var name = button.getAttribute('data-ci-list');
      var box = $('textarea[data-ci-list="' + name + '"]', body);
      var text = box.value.trim();
      if (!text) { focusOn(box); return; }
      state[name].push(text);
      box.value = '';
      renderJourney();
      focusOn(box);
    });
  });

  // ---- Delete everything.
  var confirmLine = $('.ci-erase-confirm', body);
  var doneLine = $('.ci-erase-done', body);
  show(confirmLine, false);
  show(doneLine, false);
  $('.ci-erase-start', body).addEventListener('click', function () {
    show(confirmLine, true);
    show(doneLine, false);
    focusOn($('.ci-erase-no', body));
  });
  $('.ci-erase-no', body).addEventListener('click', function () {
    show(confirmLine, false);
    focusOn($('.ci-erase-start', body));
  });
  $('.ci-erase-yes', body).addEventListener('click', function () {
    state = emptyState();
    shown = {};
    $$('textarea', body).forEach(function (box) { box.value = ''; });
    $$('input', body).forEach(function (input) { input.checked = false; });
    $$('.ci-suggestion-text', body).forEach(function (text) { text.textContent = ''; });
    $('.ci-fill-feeling', body).textContent = '';
    clearJournalForm();
    renderEntries();
    renderJourney();
    show(stepList, false);
    show(result, false);
    show(idea, false);
    $$('.ci-set-aside, .ci-kept-note, .ci-kept-reflection-note', body).forEach(function (note) { show(note, false); });
    show(confirmLine, false);
    show(doneLine, true);
    focusOn($('#ci-erase-title', body));
  });
  $('#ci-erase-title', body).setAttribute('tabindex', '-1');

  // Messages start hidden and appear when something happens.
  $$('.ci-set-aside, .ci-kept-note, .ci-kept-reflection-note', body).forEach(function (note) { show(note, false); });
  renderEntries();
  renderJourney();
  if (location.hash) followHash();

  // For the phone app only (app/), which saves on the phone. The website never calls these, and
  // this script still sends and stores nothing.
  window.TidelightCheckIn = {
    getState: function () {
      var copy = JSON.parse(JSON.stringify(state));
      copy.editing = null;
      copy.step = 0;
      return copy;
    },
    setState: function (saved) {
      state = emptyState();
      Object.keys(state).forEach(function (key) {
        if (saved && Object.prototype.hasOwnProperty.call(saved, key)) state[key] = saved[key];
      });
      state.editing = null;
      state.step = 0;
      // Dates come back from the phone as text, so turn them back into dates.
      state.checkins = (state.checkins || []).map(function (date) { return new Date(date); })
        .filter(function (date) { return !isNaN(date); });
      state.entries = (state.entries || []).filter(function (entry) { return entry && entry.text; });
      state.entries.forEach(function (entry) {
        entry.date = new Date(entry.date);
        if (isNaN(entry.date)) entry.date = new Date();
      });
      $$('.ci-card', body).forEach(function (card) {
        var kept = state.reflections[card.getAttribute('data-reflection')];
        $('textarea', card).value = kept ? kept.answer : '';
      });
      renderEntries();
      renderJourney();
    }
  };
})();
