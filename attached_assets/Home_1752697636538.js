import Constants from "expo-constants";
import React from "react";
import {useWindowDimensions} from "react-native";
import {SceneMap, TabView} from "react-native-tab-view";
import {Box, Button, Center, Flex, ScrollView, View} from "native-base";
import {useTranslation} from "react-i18next";

// components
import SingleCategory from "../components/SingleCategory";
import SearchBar from "../components/SearchBar";

// resources
import {mainCategoriesList, mainCategoriesListYouth} from "../resources/BaseData";

// services
import StaticDataService from "../service/StaticDataService";

// files
import * as CategoryImages from '../files/images/categories';

export default function Home({navigation}) {
    const {t} = useTranslation();

    const layout = useWindowDimensions();

    const [index, setIndex] = React.useState(0);

    const categoryList = Constants.expoConfig.extra.isGeneralApp ? mainCategoriesList : mainCategoriesListYouth;

    const CategoryTab = () => {
        return (
            <Center flex={1}>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <Flex direction="row" flexWrap="wrap" justifyContent="center" pt={4}>
                        {categoryList.map((category, cIndex) => {
                            const localImage = category.image.replace(/-([a-z])/g, function (g) {
                                return g[1].toUpperCase();
                            }).replace('-', '');

                            return <Flex
                                direction="row"
                                key={"main-cat-list-key-" + cIndex}
                                alignItems="center"
                                justifyContent="center"
                            >
                                <SingleCategory
                                    navigation={navigation}
                                    {...category}
                                    imageSource={CategoryImages[localImage]}
                                />
                            </Flex>
                        })}
                    </Flex>
                </ScrollView>
            </Center>
        );
    }

    const SearchTab = () => <Box flex={1} width="90%" maxW="700" mx="auto" pt="4">
        <SearchBar onEnterSearch={(text) => {
            StaticDataService.search = text;
            StaticDataService.mainCategory = {};
            navigation.navigate('result-page');
        }}/>
    </Box>;

    const renderTabBar = () => {
        return (
            <Button.Group
                borderRadius="20"
                isAttached
                colorScheme="primary.600"
                justifyContent="center"
                mx="auto"
                mb="2"
                width="85%"
                maxW="700"
            >
                <Button
                    bgColor={index === 0 ? 'primary.600' : 'yellow.400'}
                    _text={{color: index === 0 ? 'white' : 'black', fontSize: 17, fontWeight: 600}}
                    width="50%"
                    px="5"
                    pl="8"
                    size="lg"
                    onPress={() => setIndex(0)}
                >{t('categories')}</Button>
                <Button
                    bgColor={index === 1 ? 'primary.600' : 'yellow.400'}
                    _text={{color: index === 1 ? 'white' : 'black', fontSize: 17, fontWeight: 600}}
                    width="50%"
                    px="5"
                    pr="8"
                    size="lg"
                    onPress={() => setIndex(1)}
                >{t('search211')}</Button>
            </Button.Group>
        );
    };

    const [routes] = React.useState([
        {key: 'first', title: t('categories')},
        {key: 'second', title: t('search211')}
    ]);

    const renderScene = SceneMap({
        first: CategoryTab,
        second: SearchTab
    });

    return (
        <View
            flex={1}
            pt="4"
        >
            <TabView
                navigationState={{index, routes}}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={{width: layout.width}}
            />
        </View>
    );
}
