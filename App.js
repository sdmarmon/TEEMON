import React, {Component} from 'react';
import {View} from 'react-native';
import { StackNavigator } from 'react-navigation'; // Version can be specified in package.json
import { Container, Header, Content, Footer, FooterTab, Button, Icon, Text, Left, Body, Right, Title, List, ListItem, Picker, Separator, Form, Item, Input, Label, CheckBox} from 'native-base';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', createFromLocation:'~bdd.db'})

class Recherche extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rgs: [],
      divs:[],
      voc: [],
      pseudonymes: [],
      rangs:[],
      selectedRang: '0',
      vocal:true
    };
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM rangs', [], (tx, results) => {
          var len = results.rows.length;
          var rr = [];
          if (len>0){
            for(let i = 0;i<len;i++){
              var r = results.rows.item(i);
              rr.push(r.Nom);
            }
            rr.push("Tous")
            this.setState({rangs: rr});
          }
      });
    });
  }
  Recherche() {
    db.transaction((tx) => {
      var insertions = [];
      var bool;
      this.state.vocal ? bool = 1 : bool = 0;
      var requete;
      if (bool == 0)
      {
        if(this.state.rangs[this.state.selectedRang] == "Tous")
        {
          requete = 'SELECT * FROM joueurs';
        }
        else{
          requete = 'SELECT * FROM joueurs WHERE Rang=?';
          insertions.push(this.state.rangs[this.state.selectedRang]);
        }
      }
      else{
        if(this.state.rangs[this.state.selectedRang] == "Tous")
        {
          requete = 'SELECT * FROM joueurs WHERE Vocal=?';
          insertions.push(bool);
        }
        else{
          requete = 'SELECT * FROM joueurs WHERE Vocal=? AND Rang=?';
          insertions.push(bool);
          insertions.push(this.state.rangs[this.state.selectedRang]);
        }
      }
      tx.executeSql(requete, insertions, (tx, results) => {
        var len = results.rows.length;
        var rgs = [];
        var divisions = [];
        var pseudonymes = [];
        var voc = [];
        var r;
        if (len>0){
          for(let i = 0;i<len;i++){
            r = results.rows.item(i);
            pseudonymes.push(r.Nom);
            rgs.push(r.Rang);
            divisions.push(r.Division);
            voc.push(r.Vocal);
          }
        }
      this.setState({rgs: rgs});
      this.setState({divs: divisions});
      this.setState({voc: voc});
      this.setState({pseudonymes: pseudonymes});
      });
    });
  }
  static navigationOptions = {
    header: null,
    };
  render() {
    return (
      <Container>
        <Header>
        <Left>
          <Button transparent onPress={() => this.props.navigation.goBack()}>
            <Icon name='arrow-back' />
          </Button>
        </Left>
          <Body>
            <Title>Recherche</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <List>
          <ListItem>
              <Body>
                <Text>Rang</Text>
              </Body>
              <Left>
                <Picker
                style={{flex:1}}
                mode="dialog"
                selectedValue={this.state.selectedRang}
                onValueChange={(value) =>
                  this.setState({selectedRang: value})
                }>
                {this.state.rangs.map((item, index) => {
                  return (<Picker.Item label={item} value={index} key={index} />)
                })}
                </Picker>
              </Left>
            </ListItem>
            <ListItem last>
              <CheckBox checked={this.state.vocal} color="green" onPress={() => {this.setState(prevState => ({vocal: !prevState.vocal}));}} />
                <Body>
                  <Text>Vocal</Text>
                </Body>
            </ListItem>
          </List>
          <View style={{flex: 1, marginHorizontal:40}}>
            <Button block info
              onPress={() => {this.Recherche()}}
              accessibilityLabel="Rechercher">
              <Text>Rechercher</Text>
            </Button>
          </View>
        {this.state.pseudonymes.map((item, index) => {
          var voc;
          (this.state.voc[index] == 1) ? voc = "Peut vocal" : voc = "Ne peut pas vocal";
          return (<List key={index}>
                <Separator bordered key={index}><Text style={{fontSize:20}}>{item}</Text></Separator>
                <ListItem key={index}><Text>{this.state.rgs[index]} {this.state.divs[index]}</Text></ListItem>
                <ListItem key={index} last><Text>{voc}</Text></ListItem>
                <ListItem itemDivider></ListItem></List>)
        })}
        </Content>
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Profil')}>
              <Icon name="person" />
            </Button>
            <Button vertical active onPress={() => this.props.navigation.navigate('Recherche')}>
              <Icon active name="search" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Messages')}>
              <Icon name="chatboxes" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Parametres')}>
              <Icon name="settings" />
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

class Profil extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected1: '1',
      selected2: '2',
      rangs: [],
      selectedRang: '0',
      divs:[],
      possedeDivisions: true,
      selecteddiv: '1',
      vocal: true,
      pseudonyme: "",
      pseudos:[]
    };
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM rangs', [], (tx, results) => {
          var len = results.rows.length;
          var rr = [];
          if (len>0){
            for(let i = 0;i<len;i++){
              var r = results.rows.item(i);
              rr.push(r.Nom);
            }
            this.setState({rangs: rr});
          }
      });
      tx.executeSql('SELECT * FROM joueurs', [], (tx, results) => {
        var len2 = results.rows.length;
        var jj = [];
        if (len2>0){
          for(let j = 0;j<len2;j++){
            var p = results.rows.item(j);
            jj.push(p.Nom);
          }
          this.setState({pseudos: jj});
        }
    });
    });
  }
  Division() {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM rangs WHERE Nom=?', [this.state.rangs[this.state.selectedRang]], (tx, results) => {
          var len = results.rows.length;
          if (len==1){
              var r = results.rows.item(0);
              if(r.possedeDivisions == 1){
                this.setState({possedeDivisions: true})
              }
              else{
                this.setState({possedeDivisions: false})
              }
          }
      });
    });
  }
  Ajout(){
    if (this.state.pseudonyme != (null || undefined || "")){
      var req;
      var insertions;
      var peutVocal;
      this.state.vocal ? peutVocal=1 : peutVocal=0;
      if (this.state.pseudos.includes(this.state.pseudonyme)){
        req = 'UPDATE joueurs SET Rang=?, Division=?, Vocal=? WHERE Nom=?';
        insertions = [this.state.rangs[this.state.selectedRang], this.state.selecteddiv, peutVocal, this.state.pseudonyme];
      }
      else{
        req = 'INSERT INTO joueurs (Nom, Rang, Division, Vocal) VALUES (?, ?, ?, ?)';
        insertions = [this.state.pseudonyme, this.state.rangs[this.state.selectedRang], this.state.selecteddiv, peutVocal];
      }
      db.transaction((tx) => {
          tx.executeSql(req, insertions);
        });
      alert("Ajout effectué !");
    }
    else{
      alert("Veuillez remplir votre pseudonyme");
    }
  }
  static navigationOptions = {
    header: null,
  };
  render() {
    return (
      <Container>
        <Header>
        <Left>
          <Button transparent onPress={() => this.props.navigation.goBack()}>
            <Icon name='arrow-back' />
          </Button>
        </Left>
          <Body>
            <Title>Profil</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <List>
            <Separator bordered>
              <Text style={{fontSize:20}}>Groupe 2</Text>
            </Separator>
            <ListItem>
              <Body>
                <Text>Je suis</Text>
              </Body>
              <Left>
                <Picker
                selectedValue={this.state.selected1}
                onValueChange={(value) => {
                  this.setState({selected1: value});
                }}
                style={{flex:1}}
                mode="dropdown">
                  <Picker.Item label="une banane" value="0" />
                  <Picker.Item label="un projet info" value="1" />
                </Picker>
              </Left>
            </ListItem>
            <ListItem last>
              <Body>
                <Text>Je serai</Text>
              </Body>
              <Left>
                <Picker
                selectedValue={this.state.selected2}
                onValueChange={(value) => {
                  this.setState({selected2: value});
                }}
                style={{flex:1}}
                mode="dropdown">
                  <Picker.Item label="Shaman King" value="0"  />
                  <Picker.Item label="le meilleur dresseur" value="1" />
                  <Picker.Item label="le roi des pirates" value="2" />
                </Picker>
              </Left>
            </ListItem>
            <ListItem itemDivider>
              <Text>Groupe 1</Text>
            </ListItem>
            <Item floatingLabel>
              <Label>Entrez votre pseudonyme</Label>
              <Input onChangeText={(text) => this.setState({pseudonyme: text})} />
            </Item>
            <ListItem>
              <Body>
                <Text>Rang</Text>
              </Body>
              <Left>
                <Picker
                style={{flex:1}}
                mode="dialog"
                selectedValue={this.state.selectedRang}
                onValueChange={(value) =>
                  this.setState({selectedRang: value}, () => this.Division())
                }>
                {this.state.rangs.map((item, index) => {
                  return (<Picker.Item label={item} value={index} key={index} />)
                })}
                </Picker>
              </Left>
            </ListItem>
          {(this.state.possedeDivisions &&
              <ListItem>
              <Body>
                <Text>Division</Text>
              </Body>
              <Left>
                <Picker
                style={{flex:1}}
                mode="dialog"
                selectedValue={this.state.selecteddiv}
                onValueChange={(value) => {
                  this.setState({selecteddiv: value})
                }}>
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                  <Picker.Item label="3" value="3" />
                  <Picker.Item label="4" value="4" />
                  <Picker.Item label="5" value="5" />
                </Picker>
              </Left>
            </ListItem>)}
            <ListItem last>
              <CheckBox checked={this.state.vocal} color="green" onPress={() => {this.setState(prevState => ({vocal: !prevState.vocal}));}} />
                <Body>
                  <Text>Vocal</Text>
                </Body>
            </ListItem>
          </List>
          <Separator/>
          <View style={{flex: 1, marginHorizontal:40}}>
            <Button block info
              onPress={() => {this.Ajout()}}
              accessibilityLabel="Valider son profil">
              <Text>Valider</Text>
            </Button>
          </View>
          <Separator/>
        </Content>
        <Footer>
          <FooterTab>
            <Button vertical active onPress={() => this.props.navigation.navigate('Profil')}>
              <Icon active name="person" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Recherche')}>
              <Icon name="search" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Messages')}>
              <Icon name="chatboxes" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Parametres')}>
              <Icon name="settings" />
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

class Messages extends Component {
  static navigationOptions = {
    header: null,
    };
  render() {
    return (
      <Container>
        <Header>
        <Left>
          <Button transparent onPress={() => this.props.navigation.goBack()}>
            <Icon name='arrow-back' />
          </Button>
        </Left>
          <Body>
            <Title>Messages</Title>
          </Body>
          <Right />
        </Header>
        <Content />
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Profil')}>
              <Icon name="person" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Recherche')}>
              <Icon active name="search" />
            </Button>
            <Button vertical active onPress={() => this.props.navigation.navigate('Messages')}>
              <Icon name="chatboxes" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Parametres')}>
              <Icon name="settings" />
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

class Parametres extends Component {
  static navigationOptions = {
    header: null,
    };
  render() {
    return (
      <Container>
        <Header>
        <Left>
          <Button transparent onPress={() => this.props.navigation.goBack()}>
            <Icon name='arrow-back' />
          </Button>
        </Left>
          <Body>
            <Title>Paramètres</Title>
          </Body>
          <Right />
        </Header>
        <Content />
        <Footer>
          <FooterTab>
            <Button vertical onPress={() => this.props.navigation.navigate('Profil')}>
              <Icon name="person" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Recherche')}>
              <Icon name="search" />
            </Button>
            <Button vertical onPress={() => this.props.navigation.navigate('Messages')}>
              <Icon name="chatboxes" />
            </Button>
            <Button active vertical onPress={() => this.props.navigation.navigate('Parametres')}>
              <Icon name="settings" />
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const RootStack = StackNavigator(
  {
    Recherche: {
      screen: Recherche,
    },
    Profil: {
      screen: Profil,
    },
    Messages: {
      screen: Messages,
    },
    Parametres: {
      screen: Parametres
    }
  },
  {
    initialRouteName: 'Recherche',
  }
);

export default class App extends Component {
  render() {
    return <RootStack />;
  }
}