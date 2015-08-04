/*
Copyright 2014 Newcastle University

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/*
 This extension adds a JME data type to represent permutations.
*/

Numbas.queueScript('extensions/permutations/permutations.js',['jme','jme-display'],function() {
	var permutations = Numbas.extensions.permutations = {};

	var Permutation = permutations.Permutation = function(to) {
		if(to==undefined) {
			to = [];
		}
		for(var i=0;i<to.length;i++) {
			if(to[i]===undefined) {
				to[i] = i;
			}
		}
		this.to = to;
		this.n = this.to.length;

		var l = this.to.slice().sort();
		var old = null;
		for(var i=0;i<l.length;i++) {
			if(l[i]==old) {
				throw(new Numbas.Error("Permutation map is not a bijection: "+this.to));
			}
			old = l[i];
		}
	}
	Permutation.prototype = {
		map: function(n) {
			if(n<0) {
				throw(new Numbas.Error("Permutations only work on natural numbers, not "+(n+1)+"."));
			} else if(n<this.n) {
				return this.to[n];
			} else {
				return n;
			}
		},
		inverse: function() {
			var out = [];
			for(var i=0;i<this.n;i++) {
				out[this.to[i]] = i;
			}
			return new Permutation(out);
		},
		compose: function(p2) {
			var out = this.to.slice();
			var l = Math.max(this.n,p2.n);
			for(var i=0;i<l;i++) {
				out[i] = p2.map(this.map(i));
			}
			return new Permutation(out);
		},
		equal: function(p2) {
			var e = this.compose(p2.inverse());
			for(var i=0;i<e.n;i++) {
				if(e.to[i]!=i) {
					return false;
				}
			}
			return true;
		},
		cycles: function() {
			if(this._cycles) {
				return this._cycles;
			}
			var tmp = [];
			var cycles = [];
			for(var i=0;i<this.n;i++) {
				if(!tmp[i]) {
					var cycle = [i];
					i = this.map(i);
					var acc = 0;
					while(i!==cycle[0]) {
						cycle.push(i);
						var oi = i;
						i = this.map(i);
						if(i===undefined) {
							throw(new Numbas.Error("Map goes to undefined"));
						}
						tmp[oi] = true;

						acc++;
						if(acc==10000) {
							throw(new Numbas.Error("Not a cycle!"));
						}
					}
					cycles.push(cycle);
				}
			}
			this._cycles = cycles;
			return cycles;
		},
		order: function() {
			var cycles = this.cycles().map(function(c){return c.length});
			if(cycles.length==1) {
				return cycles[0];
			} else {
				return lcm.apply(this,cycles);
			}
		},
		even: function() {
			return !((this.n - this.cycles().length)%2);
		},

		toString: function() {
			var cycles = this.cycles();
			var out = '';
			for(var i = 0;i<cycles.length;i++) {
				if(cycles[i].length>1) {
					out += '('+cycles[i].map(function(n){return n+1}).join(',')+')';
				}
			}
			return out;
		},
		twoLineLaTeX: function() {
			var out = '\\left[\\begin{array}{c} ';
			for(var i=0;i<this.n;i++) {
				if(i>0) {
					out +=' & ';
				}
				out += (i+1);
			}
			out += ' \\\\ ';
			for(var i=0;i<this.n;i++) {
				if(i>0) {
					out +=' & ';
				}
				out += (this.map(i)+1);
			}
			out += ' \\end{array} \\right]';
			return out;
		},
		asTranspositions: function() {
			var cycles = this.cycles();
			var out = '';
			for(var i=0;i<cycles.length;i++) {
				var cycle = cycles[i];
				if(cycle.length>1) {
					for(var j=cycle.length-1;j>0;j--) {
						out += '('+(cycle[0]+1)+','+(cycle[j]+1)+')';
					}
				}
			}
			return out;
		},

		is_rotation: function(p) {
			var start = p.to[n-1];
			var od = p.to[0]-start;
			var d;
			if(od<-p.n/2) {
				od += p.n;
			}
			if(od!=1) {
				return false;
			}
			for(var i=0;i<p.n;i++) {
				d = p.to[i]-start;
				if(d<-n/2) {
					d += p.n;
				}
				if(d!=1) {
					return false;
				}
				od = d;
				start = p.to[i];
			}
			return true;
		},
		is_flip: function(p) {
			return is_rotation(p.compose(dihedral(p.n).flip));
		}

	}

	var re_cycle_commas = /\(\s*(\d+(?:\s*,\s*\d+)*)\s*\)/g;
	var re_cycle_spaces = /\(\s*(\d+(?:\s+\d+)*)\s*\)/g;
	var re_cycle_elements = /\s*[,\s]\s*/g;
	var re_cycles = new RegExp('^\\s*(('+re_cycle_commas.source+')*|('+re_cycle_spaces.source+')*)\\s*$');
	Permutation.parse = function(str) {
		if(!re_cycles.test(str)) {
			throw(new Error('Invalid disjoint cycle notation: '+str));
		}
		var r = str.indexOf(',')>=0 ? re_cycle_commas : re_cycle_spaces;
		r.index = 0;
		var m;
		var cycles = [];
		while(m=r.exec(str)) {
			var numbers = m[1].trim().split(re_cycle_elements);
			numbers = numbers.map(function(n){ return parseInt(n)-1; });
			cycles.push(numbers);
		}
		return cycles;
	}
	Permutation.fromString = function(str) {
		var bits = Permutation.parse(str);
		var cycles = [];
		for(var i=0;i<bits.length;i++) {
			var numbers = bits[i];
			var to = [];
			for(var j=0;j<numbers.length-1;j++) {
				to[numbers[j]] = numbers[j+1];
			}
			to[numbers[numbers.length-1]] = numbers[0];
			cycles.push(to);
		}
		var out;
		if(cycles.length) {
			out = cycles[cycles.length-1];
			if(cycles.length>1) {
				for(var i=cycles.length-2;i>=0;i--) {
					var cycle = cycles[i];
					var l = Math.max(cycle.length,out.length);
					var nout = [];
					for(var j=0;j<l;j++) {
						var ot = out[j]===undefined ? j : out[j];
						out[j] = cycle[ot]===undefined ? ot : cycle[ot];
					}
				}
			}
		} else {
			out = [];
		}
		return new Permutation(out);
	}

	Permutation.is_disjoint = function(str) {
		var seen = {};
		var cycles = Permutation.parse(str);
		for(var i=0;i<cycles.length;i++) {
			var cycle = cycles[i];
			for(var j=0;j<cycle.length;j++) {
				var n = cycle[j];
				if(n!==undefined) {
					if(seen[n]) {
						return false;
					} else {
						seen[n] = true;
					}
				}
			}
		}
		return true;
	}

	Permutation.is_transpositions = function(s) {
		var cycles = Permutation.parse(s);
		for(var i=0;i<cycles.length;i++) {
			if(cycles[i].length!=2) {
				return false;
			}
		}
		return true;
	}


	function gcd(a,b) {
		var c;
		if(a<b) {
			c = a;
			a = b;
			b = c;
		}
		var m;
		while(m=a%b) {
			a=b;
			b=m;
		}
		return b;
	}
	function lcm(a,b) {
		if(arguments.length>2) {
			for(var i=1;i<arguments.length;i++) {
				b = arguments[i];
				a = a*b/gcd(a,b);
			}
			return a;
		}
		return a*b/gcd(a,b);
	}

	permutations.dihedral = function(n) {
		var rotate = [];
		for(var i=1;i<n;i++) {
			rotate.push(i);
		}
		rotate.push(0);
		var flip = [];
		for(var i=0;i<n;i++) {
			flip.push(n-1-i);
		}
		rotate = new Permutation(rotate);
		flip = new Permutation(flip);
		return {flip: flip, rotate: rotate};
	}

	var jme = Numbas.jme;
	var funcObj = jme.funcObj;
	var types = jme.types;
	var TList = jme.types.TList;

	var scope = permutations.scope = new Numbas.jme.Scope();

	var TPerm = Numbas.jme.types.permutation = Numbas.jme.types.TPerm = function(p) {
		this.value = p;
	};
	TPerm.prototype.type = 'permutation';

	function jme_perm(l) {
		l = l.map(function(i){ return i.value; });
		return new Permutation(l);
	}
	function jme_perm_fromString(s) {
		return Permutation.fromString(s);
	}
	scope.addFunction(new funcObj('permutation',[TList],TPerm,jme_perm));
	scope.addFunction(new funcObj('permutation',[types.TString],TPerm,jme_perm_fromString));
	scope.addFunction(new funcObj('perm',[TList],TPerm,jme_perm));
	scope.addFunction(new funcObj('perm',[types.TString],TPerm,jme_perm_fromString));
	scope.addFunction(new funcObj('*',[TPerm,TPerm],TPerm,function(a,b) {
		return b.compose(a);
	}));
	scope.addFunction(new funcObj('compose',[TPerm,'*TPerm'],TPerm,function() {
		var p = arguments[arguments.length-1];
		for(var i=arguments.length-2;i>=0;i--) {
			p = p.compose(arguments[i]);
		}
		return p;
	}));
	scope.addFunction(new funcObj('listval',[TPerm,types.TNum],types.TNum,function(p,n) {
		return p.map(n-1)+1;
	}));
	scope.addFunction(new funcObj('inverse',[TPerm],TPerm,function(p) {
		return p.inverse();
	}));
	scope.addFunction(new funcObj('even',[TPerm],types.TBool,function(p) {
		return p.even();
	}));
	scope.addFunction(new funcObj('order',[TPerm],types.TNum,function(p) {
		return p.order();
	}));
	scope.addFunction(new funcObj('cycles',[TPerm],TList,function(p) {
		return jme.wrapValue(p.cycles()).value;
	}));
	scope.addFunction(new funcObj('nontrivial_cycles',[TPerm],TList,function(p) {
		return jme.wrapValue(p.cycles().filter(function(c){return c.length>1})).value;
	}));
	scope.addFunction(new funcObj('show',[TPerm],types.TString,null,{
		evaluate: function(args,scope) {
			var p = args[0].value;
			var s = new types.TString(p.toString());
			s.latex = true;
			return s;
		}
	}));
	scope.addFunction(new funcObj('twoline',[TPerm],types.TString,null,{
		evaluate: function(args,scope) {
			var p = args[0].value;
			var s = new types.TString(p.twoLineLaTeX());
			s.latex = true;
			return s;
		}
	}));
	scope.addFunction(new funcObj('as_transpositions',[TPerm],types.TString,null,{
		evaluate: function(args,scope) {
			var p = args[0].value;
			var s = new types.TString(p.asTranspositions());
			s.latex = true;
			return s;
		}
	}));


	Numbas.util.equalityTests.permutation = function(a,b) {
		return a.value.equal(b.value);
	};

	Numbas.jme.display.typeToTeX.permutation = function(thing,tok,texArgs,settings) {
		return tok.value.toString();
	};

	Numbas.jme.display.typeToJME.permutation = function(thing,tok,bits,settings) {
		return 'perm("'+tok.value.toString()+'")';
	};

});
