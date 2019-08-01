import React, { Component } from 'react';
import ReactDOM from 'react-dom'
//import logo from './logo.svg';
import './App.css';
//import './bootstrap.min.css';

class App extends Component {


    constructor(props) {
	super(props);

	this.state = {
	    page: 'search',
	    query: '',
      phenos: [],
	    search: '',
	    section: '',
	    searchResults: {"taxon": [], "diseases": [], "phenotypes": []},
	    searchResultsShow: false,
	    result: {},
      queryResult:{},
      queryReady: false,
      disName: '',
      pathogens: []
	};
    }

   componentWillMount() {
	const params = this.props;//match.params;
	if (params.page === 'search' && params.section !== undefined && params.query !== undefined) {

      this.executeQuery(params.section, params.query);
	    this.setState({page: params.page,section: params.section, query: params.query});
	} else if (params.page !== undefined){
	    this.setState({page: params.page});
	}
    }

    searchChange(e) {
	var search = e.target.value;
	this.setState({search: search});
	if (search.length >= 3) {
	    this.executeSearch(search);
	    this.setState({searchResultsShow: true });
	} else {
	    this.setState({searchResultsShow: false});

	}
    }


    findPatho (){
      var d;
      var that = this;
      fetch('http://localhost:8000/findPatho', {
        method: 'POST',
        body: JSON.stringify(this.state.phenos)
      })
    	    .then((response) => response.json())
    	    .then(function(data) {
    		d=data;
        that.setState({queryResult: d, queryReady:true,pathogens:[]});
}).catch(err => {
          // Do something for an error here
          console.log("Error Reading data " + err);
        });
        if(this.state.queryReady)
        fetch('http://localhost:8000/getName/?iri=' + encodeURIComponent(this.state.queryResult["diseases"]) + '&format=json')
            .then((response) => response.json())
            .then(function(data) {
          d=data;
          that.setState({disName: d["label"]});})
          .catch(err => {
                    // Do something for an error here
                    console.log("Error Reading data " + err);
                  });

        var i
        if(this.state.queryReady)
        for(i=0; i<this.state.queryResult["pathogens"].length; i++)
        {
          fetch('http://localhost:8000/getName/?iri=' + encodeURIComponent(this.state.queryResult["pathogenes"][i])
              + '&format=json')
              .then((response) => response.json())
              .then(function(data) {
            d=data;
            that.setState({pathogens:this.state.pathogens.append(d["label"])});
        }).catch(err => {
            // Do something for an error here
            console.log("Error Reading data " + err);
          });
    }
    console.log(this.state.disName);
  }

    executeSearch(search) {
	var that = this;
	fetch('http://localhost:8000/searchClasses/?query=' + encodeURIComponent(search)
		  + '&format=json')
	    .then((response) => response.json())
	    .then(function(data) {
		if (data.status === 'ok') {
		    that.setState({
			searchResults: data.result,
      result:data.result,
			searchResultsShow: true});
		}
	    });
    }

    handleSearchItemClick(search) {
  var newPhenos;
  newPhenos=this.state.phenos.slice();
  newPhenos.push(search);

  this.setState({phenos:newPhenos});

    }


    renderSearchResults() {
	var results = this.state.searchResults;
  var queryResult= this.state.queryResult;
  console.log(queryResult);

	const phenotypes = results["phenotypes"].map(
	    (item) =>
		<li
 onClick={(e) => this.handleSearchItemClick(item.oboid)} >{item.label[0]}
 </li>
	);


	var open = '';
	if (this.state.searchResultsShow) {
	    open = 'open';
	}

/*  var res=[];
  var pathos=[];
  if(this.state.queryReady)
  {
   pathos = results["pathogens"].map(
	    (item) =>
		<li> {item.label[0]} </li>
	);
*/

	return (
	    <div className={'dropdown ' + open}>
		<ul class="dropdown-menu">
		<li><strong>Phenotypes</strong></li>
		{phenotypes}
	    </ul>
      <button onClick={(e) => this.findPatho()}  > search</button>
	    </div>

	);
    }


    componentWillReceiveProps(newProps) {
	var page = newProps.params.page;
	var section = newProps.match.params.section;
	var query = newProps.match.params.query;
	if (page === 'search') {
	    this.executeQuery(section, query);
	    this.setState({page: page, section: section, query: query});
	} else {
	    this.setState({page: page});
	}
    }

    innerHTML(htmlString) {
	const html = {__html: htmlString};
	return (<span dangerouslySetInnerHTML={html}></span>);
    }


    executeQuery(section, query) {
	var that = this;

	fetch('/api/search?query=' + query + '&section=' + section)
	    .then(function(response){
		return response.json();
	    })
	    .then(function(data) {
		console.log(data);
		if (data.status === 'ok') {
		    that.setState({
		    	search: data.result.label,
		    	result: data.result});
		}
		else{
		    that.setState({
		    	search: '',
		    	result: {}});
		}
	    });

    }


    renderSearchForm() {
	return (

	    <div className="row">
		<div className="col-md-6 col-md-offset-3">
		<input className="form-control input-lg" type="text"
	    value={this.state.search} onChange={(e) => this.searchChange(e)} placeholder="Search"/>
		{ this.renderSearchResults()}
	        </div>

	    </div>
	);
    }


    renderHeader() {
	var page = this.state.page;
	const menuItems = [
	    'Search','Explore', 'About', 'Help','Downloads'];
	const content = menuItems.map(function(item) {
	    var activeClass = '';
	    if (item.toLowerCase() === page) {
		activeClass = 'active';
	    }
	    return (
		    <li className={activeClass}>
		    <a href={'/#/' + item.toLowerCase()}>{ item }</a>
		    </li>
	    );
	});
	return (
		<div className="masthead">
        <nav>
          <ul className="nav nav-justified">
		{ content }
	    	<li><a href="RDFquery.html">SPARQL</a></li>
	    </ul>
        </nav>
		</div>
	);
    }

    goBack(e) {
	e.preventDefault();
	this.props.history.goBack();
    }

    renderResult() {
	var obj = this.state.result;
  console.log(obj);

	if (!obj.hasOwnProperty('class')) {
	    return (<div className="row"></div>);
	}
	var phenotypes = (<div className="hidden"></div>);
	const content = (
	    <div class="col-md-12">
		{phenotypes }
	    </div>
);
	return (<div class="row">{content}</div>);
    }


    renderSearchPage() {
	if (this.state.page === 'search') {
	    return (
		<div>
		<div className="jumbotron">
		<h1>PathoPhenoDB Search</h1>
		<p className="lead">
		   A database of pathogens and their phenotypes for
		   diagnostic support in infections.
	        </p>
		</div>
		<div className="row"><div className="col-md-12">
		<p>
		Examples:
		<ul>
		<li>Phenotype - <a href="/#/search/Phenotypes/http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FHP_0000988">Skin rash</a></li>
	    </ul>
	    </p>
		</div></div>

		<div className="row">
		{ this.renderSearchForm() }
		<br/>
		</div>
		    { this.renderResult() }
		</div>
	    );
	} else {
	    return (<div></div>);
	}
    }

    render() {
	return (
		<div className="container">
		{/* this.renderHeader()*/ }
	    { this.renderSearchPage() }
      <div className="row">
        <div className="col-lg-4">
        </div>
        <div className="col-lg-4">
        </div>
        <div className="col-lg-4">
        </div>
      </div>

      <footer className="footer">
		<p>Report any issues through <a  rel="noopener noreferrer" href="https://github.com/bio-ontology-research-group/pathophenodb/issues" target="_blank">the issue tracker</a></p><p>&copy; 2018 BORG, CBRC, KAUST.</p>
      </footer>

    </div>
    );
  }
}

//export default App;
ReactDOM.render(<App page='search' />, document.getElementById("root"));
