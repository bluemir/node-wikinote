function init(theme, transition){
	// Full list of configuration options available here:
	// https://github.com/hakimel/reveal.js#configuration
	Reveal.initialize({
		controls: true,
		progress: true,
		history: true,
		center: true,

		theme: theme,
		//|| Reveal.getQueryHash().theme, // available themes are in /css/theme

		transition: transition,
		//|| Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none
		// Optional libraries used to extend on reveal.js
		dependencies: [ { 
				src: '/!public/lib/reveal.js/lib/js/classList.js', 
				condition: function() { return !document.body.classList; } 
			}, { 
				src: '/!public/lib/reveal.js/plugin/highlight/highlight.js', 
				async: true, 
				callback: function() { hljs.initHighlightingOnLoad(); }
			}, { 
				src: '/!public/lib/reveal.js/plugin/zoom-js/zoom.js', 
				async: true,
				condition: function() { return !!document.body.classList; }
			}, { 
				src: '/!public/lib/reveal.js/plugin/notes/notes.js', 
				async: true, condition: function() { return !!document.body.classList; }
			}
		]
	});
}
