import React from 'react';
import { StyleSheet, TextInput, View, SafeAreaView,
  FlatList, TouchableOpacity, Text } from 'react-native';

import firebase from 'firebase';
import '@firebase/firestore';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

const firebaseConfig = {
  apiKey: "AIzaSyAOFAGqFifSkvI4jRvR8Nq3Dus2JAyvPfQ",
  authDomain: "lesson07-firebasedemo.firebaseapp.com",
  databaseURL: "https://lesson07-firebasedemo.firebaseio.com",
  projectId: "lesson07-firebasedemo",
  storageBucket: "lesson07-firebasedemo.appspot.com",
  messagingSenderId: "1085673325819",
  appId: "1:1085673325819:web:9f32eac784f4117e825c5e"
};

function deleteFromListByKey(list, key) {
  for (let i = 0; i < list.length; i++) { // look for the match
    if (list[i].key === key) { // find the match
      list.splice(i, 1); // remove the match
      break;
    }
  }
  // list is modified in place, nothing to return
}

class ListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {item: this.props.item};  
    this.parent = this.props.parent;
    this.itemsRef = this.parent.itemsRef;
  }

  handleUpdate = () => {
    this.parent.props.navigation.navigate('Details', {
      item: this.state.item,
      itemView: this
    })
  }

  handleDelete = () => {
    this.itemsRef.doc(this.state.item.key).delete().then(() => {
        let tempList = this.parent.state.theList.slice(); // clone
        deleteFromListByKey(tempList, this.state.item.key);
        this.parent.setState({theList: tempList});
      }
    )
  }

  itemShouldUpdate(newItem) {
    let firebaseDoc = {text: newItem.text};
    this.itemsRef.doc(this.state.item.key).set(firebaseDoc);
    this.setState({item: newItem});
  }

  render() {
    return (
      <View style={styles.listRow}>
        <Text>{this.state.item.text}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {this.handleUpdate();}}
            style={styles.button}>
            <Text style={styles.buttonText}s>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {this.handleDelete();}}
            style={styles.button}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export class HomeScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      theList: [],
      inputText: ''
    }

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    this.itemsRef = db.collection('items');
    this.itemsRef.get().then(queryRef => {
      let initList = [];
      queryRef.forEach(item => {
        let tempItem = {
          text: item.data().text,
          key: item.id
        };
        initList.push(tempItem);
      });
      this.setState({theList: initList});
    });
  }

  handleChangeText = (text) =>  {
    this.setState({inputText: text});
  }

  handleButtonPress = () => {
    let newItem = {text: this.state.inputText};
    this.itemsRef.add(newItem).then(doc => {
      newItem.key = doc.id;
      let tempList = this.state.theList.slice(); // clone
      tempList.push(newItem);
      this.setState({
        theList: tempList,
        inputText: ''
      });
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.list}>
        <FlatList
          data={this.state.theList}
          renderItem={({item})=>{
              return  (
                <ListItem
                  parent={this}
                  item={item}
                />
              );
            }
          }
        />
        </View>
        <TextInput
          style={styles.inputText}
          placeholder='Enter Item'
          onChangeText={this.handleChangeText}
          value={this.state.inputText}/>
        <TouchableOpacity
          onPress={this.handleButtonPress}
          style={styles.button}>
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

class DetailsScreen extends React.Component {

  constructor(props) {
    super(props);
    this.item = this.props.navigation.getParam('item');
    this.itemView = this.props.navigation.getParam('itemView');
    this.state = {
      itemText: this.item.text
    }
  }

  handleSave = () => {
    this.item.text = this.state.itemText;
    this.itemView.itemShouldUpdate(this.item);
    this.props.navigation.goBack();
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          value={this.state.itemText}
          onChangeText={(text)=>{this.setState({itemText: text})}}
        />
        <TouchableOpacity
          onPress={() => {this.props.navigation.goBack()}}
          style={styles.button}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.handleSave}
          style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    Details: DetailsScreen,
  },
  {
    initialRouteName: 'Home',
  }
);
const AppContainer = createAppContainer(AppNavigator);
export default AppContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 0.7
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
    padding: 10
  },
  buttonContainer: {
    flex: 0.4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  button: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginHorizontal: 3,
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1,
  },
  buttonText: {
    color: 'blue'
  },
  inputText: {
    borderBottomColor: 'black',
    borderBottomWidth: 0.5, 
    width: '50%',
    margin: 10,
  }
});
