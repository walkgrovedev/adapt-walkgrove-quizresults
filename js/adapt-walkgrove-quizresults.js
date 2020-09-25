define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel'
], function(Adapt, ComponentView, ComponentModel) {

  var QuizResultsView = ComponentView.extend({

    ppreRender: function() {
      this.checkIfResetOnRevisit();
    },

    postRender: function() {
      this.setReadyStatus();

      this.setupInview();
    },

    setupInview: function() {
      var selector = this.getInviewElementSelector();
      if (!selector) {
        this.setCompletionStatus();
        return;
      }

      this.setupInviewCompletion(selector);
      this.setupInviewContent('.quizresults__image');

    },

    setContent: function() {
      let contentbody = this.model.get('body');
      let alternatecontent = this.model.get('alternate_body');

      const graphic = this.model.get('_graphic').src;
      const alternategraphic = this.model.get('_alternate_graphic').src;

      const screensForBonus = this.model.get('_bonus_screens');
      const bonusPoints = this.model.get('_bonus_points');
      const completionPoints = this.model.get('_completion_points');
      const pointsEachScreen = this.model.get('_screen_points');

      let points = completionPoints;
      let screensCorrect = 0;
      
      this.model.get('_screens').forEach(function(screen, index) {
        const screenId = "c-" + screen._screen_id;

        if(Adapt.findById(screenId).get('_score') === 1) {
          screensCorrect++;
          points += pointsEachScreen;
        }

      });

      let content = contentbody;

      if(screensCorrect >= screensForBonus) {

        points += bonusPoints;
        content = alternatecontent;
        content = content.replace('{0}','' + points + '');

        this.$('.quizresults__image').attr('src', '' + alternategraphic + '');

      } else {

        content = content.replace('{0}','' + points + '');
        this.$('.quizresults__image').attr('src', '' + graphic + '');

      }

      this.$('.component__body-inner').html(content);

      this.removeInviewListener();

    },

    /**
     * determines which element should be used for inview logic - body, instruction or title - and returns the selector for that element
     */
    getInviewElementSelector: function() {
      if (this.model.get('body')) return '.component__body';

      if (this.model.get('instruction')) return '.component__instruction';

      if (this.model.get('displayTitle')) return '.component__title';

      return null;
    },

    checkIfResetOnRevisit: function() {
      var isResetOnRevisit = this.model.get('_isResetOnRevisit');

      // If reset is enabled set defaults
      if (isResetOnRevisit) {
        this.model.reset(isResetOnRevisit);
      }
    }


  },
  {
    template: 'quizresults'
  });

  return Adapt.register('quizresults', {
    model: ComponentModel.extend({}),// create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: QuizResultsView
  });
});
