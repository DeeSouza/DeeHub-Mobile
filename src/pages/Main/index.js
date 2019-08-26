import React, { Component } from 'react';
import { Keyboard, ActivityIndicator, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Bio,
  Name,
  Buttons,
  ProfileButton,
  ProfileButtonText,
  ProfileButtonDelete,
  ProfileButtonDeleteText,
  NoUsers,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  state = {
    users: [],
    newUser: '',
    loading: false,
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');
    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    const { users, newUser } = this.state;

    this.setState({ loading: true });

    try {
      const response = await api.get(`/users/${newUser}`);

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar_url: response.data.avatar_url,
      };

      this.setState({
        users: [...users, data],
        newUser: '',
      });

      Keyboard.dismiss();

      this.setState({ loading: false });
    } catch (err) {
      this.setState({ loading: false });
    }
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  handleDelete = user => {
    const { users } = this.state;

    const newList = users.filter(item => item.login !== user.login);

    this.setState({ users: newList });

    ToastAndroid.showWithGravityAndOffset(
      'O usuário foi removido',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      0,
      60
    );
  };

  render() {
    const { users, newUser, loading } = this.state;

    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Adicionar Usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />

          <SubmitButton onPress={this.handleAddUser} loading={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>

        {!users.length > 0 && (
          <NoUsers>Você ainda não adicionou usuários.</NoUsers>
        )}

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar_url }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>

              <Buttons>
                <ProfileButton onPress={() => this.handleNavigate(item)}>
                  <ProfileButtonText>Ver Perfil</ProfileButtonText>
                </ProfileButton>

                <ProfileButtonDelete onPress={() => this.handleDelete(item)}>
                  <ProfileButtonDeleteText>Remover</ProfileButtonDeleteText>
                </ProfileButtonDelete>
              </Buttons>
            </User>
          )}
        />
      </Container>
    );
  }
}

Main.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }).isRequired,
};
