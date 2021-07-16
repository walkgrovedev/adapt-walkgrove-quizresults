define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel'
], function(Adapt, ComponentView, ComponentModel) {

  var QuizResultsView = ComponentView.extend({

    events: {
      'click .js-retry-click': 'onRetryQuestions'
    },

    preRender: function() {
      this.checkIfResetOnRevisit();
    },

    postRender: function() {
      this.setReadyStatus();

      this.setupInview();
    },

    setupInview: function() {
      var selector = this.getInviewElementSelector();
      if (!selector) {
        //this.setCompletionStatus();
        return;
      }

      this.setupInviewCompletion(selector);
      this.setupInviewContent('.quizresults__image');

    },

    setContent: function() {
      let contentbody = this.model.get('body');
      let alternatecontent = this.model.get('alternate_body');
      let contentbodyalmost = this.model.get('bodyAlmost');
      let contentinsalmost = this.model.get('insAlmost');

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
      let passed = false;

      if(screensCorrect >= screensForBonus) {

        points += bonusPoints;
        
        content = alternatecontent;
        content = content.replace('{0}','' + this.setWordPoints(points) + '');

        this.$('.quizresults__image').attr('src', '' + alternategraphic + '');

        passed = true;

        //show incorrect
        const showQ = this.model.get('_screens').length - 2;

        //console.log(screensCorrect, screensForBonus, this.model.get('_screens').length, showQ);

        if(screensCorrect >= showQ && screensCorrect !== this.model.get('_screens').length) {

          content = contentbodyalmost;
          content = content.replace('{0}','' + this.setWordPoints(points) + '');

          //list the incorrect questions (4/5 correct)
          content += '<ul>';
          this.model.get('_screens').forEach(function(screen, index) {
            const screenId = "c-" + screen._screen_id;
    
            if(Adapt.findById(screenId).get('_score') !== 1) {
              content += '<li><p><strong>' + Adapt.findById(screenId).get('displayTitle') + '</strong></p>' + Adapt.findById(screenId).get('body') + '</li>';
            }
          });
          content += '</ul>';

          content += contentinsalmost;
        }

      } else {

        content = content.replace('{0}','' + this.setWordPoints(points) + '');
        this.$('.quizresults__image').attr('src', '' + graphic + '');

        this.$('.quizresults__button').removeClass('is-hidden');

        //list the incorrect questions
        content += '<ul>';
        this.model.get('_screens').forEach(function(screen, index) {
          const screenId = "c-" + screen._screen_id;
  
          if(Adapt.findById(screenId).get('_score') !== 1) {
            content += '<li><p><strong>' + Adapt.findById(screenId).get('displayTitle') + '</strong></p>' + Adapt.findById(screenId).get('body') + '</li>';
          }
        });
        content += '</ul>';

      }

      this.$('.component__body-inner').html(content);

      //Adapt.offlineStorage.set('leadership_value', points);
      const percent = (100/this.model.get('_screens').length) * screensCorrect;
      //Adapt.offlineStorage.set('score', percent);
      Adapt.offlineStorage.set("score", percent, 0, 100);

      this.removeInviewListener();

      if(passed) {
        this.setCompletionStatus(); 

        //audio?
        if (Adapt.config.get('_sound')._isActive === true) {
          if (this.model.get('_pass_audio')) {
            Adapt.trigger('audio:feedback', {src: this.model.get('_pass_audio')._src});
          }
        }
      } else {

        //audio?
        if (Adapt.config.get('_sound')._isActive === true) {
          if (this.model.get('_fail__audio')) {
            Adapt.trigger('audio:feedback', {src: this.model.get('_fail__audio')._src});
          }
        }
        
      }

    },

    setWordPoints: function(_points) {
      let pointsStr = '';
      pointsStr = Math.round((100/this.model.get('_screens').length)*_points) + "%";
      // switch(_points){
      //   case 1:
      //     pointsStr = 'one';
      //     break;
      //   case 2:
      //     pointsStr = 'two';
      //     break;
      //   case 3:
      //     pointsStr = 'three';
      //     break;
      //   case 4:
      //     pointsStr = 'four';
      //     break;
      //   case 5:
      //     pointsStr = 'five';
      //     break;
      // }
      return pointsStr;
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
    },

    onRetryQuestions() {
      //var currentModel = Adapt.findById(Adapt.location._currentId);
      // currentModel.getChildren().each(child => {
      //   child.getChildren().each(child2 => {
      //     this.model.get('_screens').forEach(function(screen, index) {
      //       var screenId = "b-"+screen._screen_id;
      //       if(screenId === child2.attributes._id) {
      //         // child2.set({
      //         //   '_isInteractionComplete': false,
      //         //   '_isComplete': false
      //         // });
      //         child2.reset(true);
      //         console.log(child2);
      //       }
      //     });
      //   }); 
      // });
      
      this._forceResetOnRevisit = true;

      this.listenToOnce(Adapt, 'pageView:ready', function() {
        if (typeof callback == 'function') {
          callback(true);
        }
      });

      _.delay(function() {
        Backbone.history.navigate('#/id/' + Adapt.location._currentId, { replace:true, trigger: true });
      }, 250);
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
