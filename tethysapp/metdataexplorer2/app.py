from tethys_sdk.base import TethysAppBase, url_map_maker
from tethys_sdk.permissions import Permission, PermissionGroup
from tethys_sdk.app_settings import PersistentStoreDatabaseSetting

class Metdataexplorer2(TethysAppBase):
    """
    Tethys app class for Met dataexplorer.
    """

    name = 'Met Data Explorer'
    index = 'metdataexplorer2:home'
    icon = 'metdataexplorer2/images/bananero.png'
    package = 'metdataexplorer2'
    root_url = 'metdataexplorer2'
    color = '#2980b9'
    description = ''
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='metdataexplorer2',
                controller='metdataexplorer2.controllers.home'
            ),
            UrlMap(
                name='getFilesAndFolders',
                url='getFilesAndFolders/',
                controller='metdataexplorer2.groups.get_files_and_folders'
            ),
            UrlMap(
                name='getVariablesAndFileMetadata',
                url='getVariablesAndFileMetadata/',
                controller='metdataexplorer2.groups.get_variables_and_file_metadata'
            ),
            UrlMap(
                name='add-group',
                url='add-group/',
                controller='metdataexplorer2.groups.add_group'
            ),
            UrlMap(
                name='load-group',
                url='load-group/',
                controller='metdataexplorer2.groups.load_group'
            ),
            UrlMap(
                name='get-groups-list',
                url='get-groups-list/',
                controller='metdataexplorer2.groups.get_groups_list'
            ),
            UrlMap(
                name='delete-groups',
                url='delete-groups/',
                controller='metdataexplorer2.groups.delete_groups'
            ),
            UrlMap(
                name='threddsProxy',
                url='threddsProxy/',
                controller='metdataexplorer2.groups.thredds_proxy'
            ),
            UrlMap(
                name='threddsProxy',
                url='threddsProxy/',
                controller='metdataexplorer2.groups.thredds_proxy'
            ),
            # UrlMap(
            #     name='getBoxValues',
            #     url='getBoxValues/',
            #     controller='metdataexplorer2.thredds.get_box_values'
            # ),
            UrlMap(
                name='getFullArray',
                url='getFullArray/',
                controller='metdataexplorer2.thredds.get_full_array'
            ),

        )

        return url_maps

    def permissions(self):

        # Viewer Permissions
        delete_groups = Permission(
            name = 'delete_groups',
            description = 'Delete a Thredds group from the App',
        )
        # Viewer Permissions
        add_groups = Permission(
            name = 'add_groups',
            description = 'Add a Thredds group to the App'
        )
        admin = PermissionGroup(
            name='admin',
            permissions=(delete_groups,add_groups)
        )


        permissions = (admin, )

        return permissions

    #### Persistant storage ###
    def persistent_store_settings(self):
        ps_settings = (
            PersistentStoreDatabaseSetting(
                name='thredds_db',
                description='thredds database',
                initializer='metdataexplorer2.init_stores.init_thredds_db',
                required=True
            ),
        )
        return ps_settings
