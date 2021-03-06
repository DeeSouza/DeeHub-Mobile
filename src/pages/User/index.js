import React, { Component } from 'react';
import { ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Bio,
  Name,
  Stars,
  Starred,
  Info,
  Title,
  Author,
  OwnerAvatar,
} from './styles';

const Toast = ({ visible }) => {
  if (!visible) {
    ToastAndroid.showWithGravityAndOffset(
      'Aguarde...',
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );

    return null;
  }

  return null;
};

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  state = {
    stars: [],
    visible: false,
    visibleList: false,
    visibleMore: false,
    page: 0,
    user: '',
    refreshing: false,
  };

  componentDidMount() {
    const { navigation } = this.props;
    const params = navigation.getParam('user');

    this.setState({ user: params }, () => {
      this.loadFavorites();
    });
  }

  refreshList = () => {
    this.setState(
      {
        page: 0,
        refreshing: true,
        visibleList: false,
        stars: [],
      },
      () => this.loadFavorites()
    );
  };

  loadFavorites = async () => {
    const { page, stars, user } = this.state;

    this.setState({ visibleMore: true });

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page: page + 1 },
    });

    this.setState({ page: page + 1 });

    if (response.data.length > 0) {
      this.setState({
        stars: [...stars, ...response.data],
        visible: true,
        visibleList: true,
        visibleMore: false,
        refreshing: false,
      });
    }
  };

  handleRepository = repo => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repo });
  };

  render() {
    const { stars, visible, visibleList, refreshing, visibleMore } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <ShimmerPlaceHolder
            autoRun
            visible={visible}
            height={100}
            width={100}
            reverse
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 50,
              marginBottom: 10,
            }}
          >
            <Avatar source={{ uri: user.avatar_url }} />
          </ShimmerPlaceHolder>

          <ShimmerPlaceHolder
            autoRun
            visible={visible}
            style={{
              backgroundColor: '#f5f5f5',
            }}
          >
            <Name>{user.name}</Name>
          </ShimmerPlaceHolder>

          <ShimmerPlaceHolder
            autoRun
            visible={visible}
            style={{
              backgroundColor: '#f5f5f5',
            }}
          >
            <Bio>{user.bio}</Bio>
          </ShimmerPlaceHolder>
        </Header>

        <ShimmerPlaceHolder
          autoRun
          visible={visibleList}
          height={60}
          style={{
            backgroundColor: '#f5f5f5',
            marginTop: 10,
            width: '100%',
          }}
        >
          <Stars
            data={stars}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadFavorites}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title onPress={() => this.handleRepository(item)}>
                    {item.name}
                  </Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        </ShimmerPlaceHolder>

        <Toast visible={visibleMore} />
      </Container>
    );
  }
}

User.propTypes = {
  navigation: PropTypes.shape({
    getParam: PropTypes.func,
    navigate: PropTypes.func,
  }).isRequired,
};
